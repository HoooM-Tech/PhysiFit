import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { payments, bookings } from "../src/db/schema";

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
  });

  console.log("Done!");
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
