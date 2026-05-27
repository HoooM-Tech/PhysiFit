import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, bookings, users, authSessions } from "@/db/schema";
import { withAuth, withRoute, readSessionToken, hashToken } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

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
});

export const POST = withRoute(async ({ req }) => {
  const body = await parseJsonBody(req, createPaymentSchema);

  // 1. Resolve user session if available
  const token = readSessionToken(req);
  let sessionUser: { id: string; email: string } | null = null;
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
        sessionUser = { id: row.userId, email: row.userEmail };
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

      const [payment] = await tx
        .insert(payments)
        .values({
          userId: targetUserId,
          bookingId: booking.id,
          amountNaira,
          provider: body.provider,
          providerRef: body.providerRef,
          status: "pending",
        })
        .returning();

      return { data: { payment }, status: 201 } as const;
    }

    // B. Event Payment Flow (Guests allowed!)
    if (sessionUser) {
      targetUserId = sessionUser.id;
    } else {
      // Unauthenticated / Guest payment: require billing email
      if (!body.email) {
        throw new ApiError("VALIDATION_ERROR", "Billing Email Address is required for guest checkout.");
      }

      // Find or create guest user
      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: body.email,
            passwordHash: "placeholder_guest_account_hash",
            fullName: "Event Guest",
            role: "client",
          })
          .returning({ id: users.id });
        targetUserId = newUser.id;
      }
    }

    amountNaira = 50000; // Default event spot price
    const [payment] = await tx
      .insert(payments)
      .values({
        userId: targetUserId,
        eventRegistrationId: body.eventRegistrationId || undefined,
        amountNaira,
        provider: body.provider,
        providerRef: body.providerRef,
        status: "pending",
      })
      .returning();

    return { data: { payment }, status: 201 } as const;
  });
});
