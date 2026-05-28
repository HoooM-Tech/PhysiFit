import { createHmac } from "crypto";
import { eq, and, desc, asc, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, bookings, eventRegistrations, users, eventParqSubmissions, events } from "@/db/schema";
import { env } from "@/lib/env";
import { successResponse } from "@/lib/api/errors";
import { notifyEventRegistrationConfirmed } from "@/lib/email/notify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return new NextResponse(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Read raw text body for signature validation
  const rawBody = await req.text();
  const computedSignature = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (computedSignature !== signature) {
    return new NextResponse(JSON.stringify({ error: "Invalid signature verification" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = JSON.parse(rawBody);

  // We are only interested in successful charge events
  if (payload.event === "charge.success" && payload.data?.status === "success") {
    const reference = payload.data.reference;

    await db.transaction(async (tx) => {
      // Find the pending payment matching the provider reference
      const [payment] = await tx
        .select()
        .from(payments)
        .where(and(eq(payments.providerRef, reference), eq(payments.status, "pending")))
        .limit(1);

      if (payment) {
        // Update payment status to confirmed
        await tx
          .update(payments)
          .set({
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        // If the payment is linked to a booking, update the booking status to confirmed
        if (payment.bookingId) {
          await tx
            .update(bookings)
            .set({
              status: "confirmed",
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, payment.bookingId));
        } else {
          // If bookingId is null, this is an event payment!
          // Get the user's email
          const [user] = await tx
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, payment.userId))
            .limit(1);

          if (user) {
            // Find the event ID. First check eventParqSubmissions for this user's email.
            const [parq] = await tx
              .select({ eventId: eventParqSubmissions.eventId })
              .from(eventParqSubmissions)
              .where(eq(eventParqSubmissions.email, user.email))
              .orderBy(desc(eventParqSubmissions.createdAt))
              .limit(1);

            let eventId = parq?.eventId;

            // If not found in PAR-Q, find the first upcoming event
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

            // Fallback: get any event
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
                .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, payment.userId)))
                .limit(1);

              let regId = existingReg?.id;
              if (!existingReg) {
                const [newReg] = await tx
                  .insert(eventRegistrations)
                  .values({
                    eventId,
                    userId: payment.userId,
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

            // Send confirmation email
            notifyEventRegistrationConfirmed(user.email);
          }
        }
      }
    });
  }

  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
