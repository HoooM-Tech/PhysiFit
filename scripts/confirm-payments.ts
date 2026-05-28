import "dotenv/config";
import { eq, and, desc, asc, gte } from "drizzle-orm";
import { db } from "../src/db/client";
import { payments, bookings, eventRegistrations, users, eventParqSubmissions, events } from "../src/db/schema";
import { notifyEventRegistrationConfirmed } from "../src/lib/email/notify";

async function main() {
  console.log("Confirming all pending payments & bookings locally...");
  
  await db.transaction(async (tx) => {
    // 1. Confirm all pending payments
    const updatedPayments = await tx
      .update(payments)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(payments.status, "pending"))
      .returning({ id: payments.id, bookingId: payments.bookingId });

    console.log(`✓ Confirmed ${updatedPayments.length} pending payments.`);

    // 2. Confirm all associated bookings
    let confirmedBookings = 0;
    for (const p of updatedPayments) {
      if (p.bookingId) {
        await tx
          .update(bookings)
          .set({ status: "confirmed", updatedAt: new Date() })
          .where(eq(bookings.id, p.bookingId));
        confirmedBookings++;
      }
    }
    console.log(`✓ Confirmed ${confirmedBookings} bookings.`);

    // 3. Confirm and link all event registrations
    let confirmedEvents = 0;
    for (const p of updatedPayments) {
      if (!p.bookingId) {
        // Find the payment object fully first
        const [fullPayment] = await tx
          .select()
          .from(payments)
          .where(eq(payments.id, p.id))
          .limit(1);

        if (fullPayment) {
          const [user] = await tx
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, fullPayment.userId))
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
                .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, fullPayment.userId)))
                .limit(1);

              let regId = existingReg?.id;
              if (!existingReg) {
                const [newReg] = await tx
                  .insert(eventRegistrations)
                  .values({
                    eventId,
                    userId: fullPayment.userId,
                    paymentId: fullPayment.id,
                    accessPassSentAt: new Date(),
                  })
                  .returning({ id: eventRegistrations.id });
                regId = newReg.id;
              } else if (!existingReg.paymentId) {
                await tx
                  .update(eventRegistrations)
                  .set({ paymentId: fullPayment.id, accessPassSentAt: new Date() })
                  .where(eq(eventRegistrations.id, existingReg.id));
              }

              // Link payment to the event registration
              await tx
                .update(payments)
                .set({ eventRegistrationId: regId })
                .where(eq(payments.id, fullPayment.id));

              confirmedEvents++;
            }

            // Send confirmation email
            notifyEventRegistrationConfirmed(user.email);
          }
        }
      }
    }
    console.log(`✓ Confirmed ${confirmedEvents} event registrations.`);
  });

  console.log("Done!");
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));

