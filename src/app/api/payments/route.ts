import { z } from "zod";
import { and, desc, eq, asc, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, bookings, users, authSessions, eventParqSubmissions, eventRegistrations, events } from "@/db/schema";
import { withAuth, withRoute, readSessionToken, hashToken } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { notifyPaymentConfirmed, notifyEventRegistrationConfirmed } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

// =============================================================================
// GET /api/payments — list current user's payments
// =============================================================================

export const GET = withAuth(async ({ user }) => {
  const rows = await db
    .select({
      id: payments.id,
      bookingId: payments.bookingId,
      eventRegistrationId: payments.eventRegistrationId,
      amountNaira: payments.amountNaira,
      currency: payments.currency,
      status: payments.status,
      provider: payments.provider,
      providerRef: payments.providerRef,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt));
  return { data: { payments: rows } };
});

// =============================================================================
// POST /api/payments — record a payment intent
// =============================================================================

const createPaymentSchema = z.object({
  bookingId: z.string().uuid().optional(),
  eventRegistrationId: z.string().uuid().optional(),
  provider: z.enum(["paystack", "flutterwave", "manual"]),
  providerRef: z.string().min(1).max(200),
  email: z.string().email().optional(),
  amountNaira: z.number().int().positive().optional(),
});

export const POST = withRoute(async ({ req }) => {
  const body = await parseJsonBody(req, createPaymentSchema);

  // 1. Resolve user session if available
  const token = readSessionToken(req);
  let sessionUser: { id: string; email: string; fullName: string } | null = null;
  if (token) {
    try {
      const tokenHash = hashToken(token);
      const [row] = await db
        .select({
          userId: authSessions.userId,
          userEmail: users.email,
        })
        .from(authSessions)
        .innerJoin(users, eq(users.id, authSessions.userId))
        .where(eq(authSessions.tokenHash, tokenHash))
        .limit(1);
      if (row) {
        sessionUser = { id: row.userId, email: row.userEmail, fullName: "" };
        // Fetch fullName for the notification
        const [u] = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.id, row.userId))
          .limit(1);
        if (u) sessionUser.fullName = u.fullName;
      }
    } catch (err) {
      // ignore and treat as guest
    }
  }

  return await db.transaction(async (tx) => {
    let amountNaira = 0;
    let targetUserId = "";

    // A. Booking Payment Flow (Requires auth)
    if (body.bookingId) {
      if (!sessionUser) {
        throw new ApiError("UNAUTHENTICATED", "Authentication required to pay for bookings.");
      }

      const [booking] = await tx
        .select({
          id: bookings.id,
          clientId: bookings.clientId,
          totalAmountNaira: bookings.totalAmountNaira,
          status: bookings.status,
        })
        .from(bookings)
        .where(eq(bookings.id, body.bookingId))
        .limit(1);

      if (!booking) throw new ApiError("NOT_FOUND", "Booking not found");
      if (booking.clientId !== sessionUser.id) {
        throw new ApiError("FORBIDDEN", "You cannot pay for another user's booking");
      }
      if (booking.status !== "pending_payment") {
        throw new ApiError("CONFLICT", `Booking is already ${booking.status}`);
      }
      amountNaira = booking.totalAmountNaira;
      targetUserId = sessionUser.id;

      const isDev = process.env.NODE_ENV === "development";
      const paymentStatus = isDev ? "confirmed" : "pending";

      const [payment] = await tx
        .insert(payments)
        .values({
          userId: targetUserId,
          bookingId: booking.id,
          amountNaira,
          provider: body.provider,
          providerRef: body.providerRef,
          status: paymentStatus,
        })
        .returning();

      if (isDev) {
        await tx
          .update(bookings)
          .set({
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));
      }

      // Email notification — fire-and-forget
      notifyPaymentConfirmed({
        userEmail: sessionUser!.email,
        userName: sessionUser!.fullName,
        amountNaira,
        providerRef: body.providerRef,
      });

      return { data: { payment }, status: 201 } as const;
    }

    // B. Event Payment Flow (Guests allowed!)
    let payName = "Event Guest";
    if (sessionUser) {
      targetUserId = sessionUser.id;
      payName = sessionUser.fullName;
    } else {
      // Unauthenticated / Guest payment: require billing email
      if (!body.email) {
        throw new ApiError("VALIDATION_ERROR", "Billing Email Address is required for guest checkout.");
      }

      // Find or create guest user
      const [existingUser] = await tx
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      // Check if there is an event PAR-Q submission with this email to get their real name!
      const [parq] = await tx
        .select({ fullName: eventParqSubmissions.fullName })
        .from(eventParqSubmissions)
        .where(eq(eventParqSubmissions.email, body.email))
        .orderBy(desc(eventParqSubmissions.createdAt))
        .limit(1);

      const guestName = parq?.fullName || "Event Guest";
      payName = guestName;

      if (existingUser) {
        targetUserId = existingUser.id;
        // If the user currently has "Event Guest" but we found a real name, update their name in users table!
        if (existingUser.fullName === "Event Guest" && guestName !== "Event Guest") {
          await tx
            .update(users)
            .set({ fullName: guestName })
            .where(eq(users.id, existingUser.id));
        }
      } else {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: body.email,
            passwordHash: "placeholder_guest_account_hash",
            fullName: guestName,
            role: "client",
          })
          .returning({ id: users.id });
        targetUserId = newUser.id;
      }
    }

    const isDev = process.env.NODE_ENV === "development";
    const paymentStatus = isDev ? "confirmed" : "pending";

    amountNaira = body.amountNaira || 50000; // Use passed amount or fallback
    const [payment] = await tx
      .insert(payments)
      .values({
        userId: targetUserId,
        eventRegistrationId: body.eventRegistrationId || undefined,
        amountNaira,
        provider: body.provider,
        providerRef: body.providerRef,
        status: paymentStatus,
      })
      .returning();

    // If payment is instantly confirmed (dev mode), register the user for the event and send the event confirmation email
    const payEmail = sessionUser?.email || body.email || "";
    if (paymentStatus === "confirmed" && payEmail) {
      // Find the event ID. First check eventParqSubmissions for this user's email.
      const [parq] = await tx
        .select({ eventId: eventParqSubmissions.eventId })
        .from(eventParqSubmissions)
        .where(eq(eventParqSubmissions.email, payEmail))
        .orderBy(desc(eventParqSubmissions.createdAt))
        .limit(1);

      let eventId = parq?.eventId;

      if (!eventId) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [upcomingEvent] = await tx
          .select({ id: events.id })
          .from(events)
          .where(gte(events.eventDate, todayStr))
          .orderBy(asc(events.eventDate))
          .limit(1);
        
        eventId = upcomingEvent?.id;
      }

      if (!eventId) {
        const [anyEvent] = await tx
          .select({ id: events.id })
          .from(events)
          .limit(1);
        eventId = anyEvent?.id;
      }

      if (eventId) {
        // Check if already registered
        const [existingReg] = await tx
          .select()
          .from(eventRegistrations)
          .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, targetUserId)))
          .limit(1);

        let regId = existingReg?.id;
        if (!existingReg) {
          const [newReg] = await tx
            .insert(eventRegistrations)
            .values({
              eventId,
              userId: targetUserId,
              paymentId: payment.id,
              accessPassSentAt: new Date(),
            })
            .returning({ id: eventRegistrations.id });
          regId = newReg.id;
        } else if (!existingReg.paymentId) {
          await tx
            .update(eventRegistrations)
            .set({ paymentId: payment.id, accessPassSentAt: new Date() })
            .where(eq(eventRegistrations.id, existingReg.id));
        }

        // Link payment to the event registration
        await tx
          .update(payments)
          .set({ eventRegistrationId: regId })
          .where(eq(payments.id, payment.id));
      }

      // Email notification for event confirmation — fire-and-forget
      notifyEventRegistrationConfirmed(payEmail);
    } else if (payEmail) {
      // Normal payment confirmation notification (payment pending)
      notifyPaymentConfirmed({
        userEmail: payEmail,
        userName: payName,
        amountNaira,
        providerRef: body.providerRef,
      });
    }

    return { data: { payment }, status: 201 } as const;
  });
});
