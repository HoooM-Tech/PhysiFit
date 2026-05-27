import { createHmac } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, bookings } from "@/db/schema";
import { env } from "@/lib/env";
import { successResponse } from "@/lib/api/errors";
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
        }

        // Note: For event registrations, update their records similarly if FK/tables exist
      }
    });
  }

  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
