import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, bookings } from "@/db/schema";
import { withAuth, withIdempotency } from "@/lib/api/handler";
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
// POST /api/payments — record a payment intent (idempotent)
//
// SECURITY: This endpoint records a payment record after the provider has
// confirmed it. The actual card capture MUST happen via a PCI-compliant
// provider (Paystack/Flutterwave). NEVER accept raw PAN/CVV here.
// Until the provider is wired, this endpoint is locked to "pending" only and
// requires the client to pass a provider transaction reference.
// =============================================================================

const createPaymentSchema = z.object({
  bookingId: z.string().uuid().optional(),
  eventRegistrationId: z.string().uuid().optional(),
  provider: z.enum(["paystack", "flutterwave", "manual"]),
  providerRef: z.string().min(1).max(200),
}).refine(
  (d) => !!d.bookingId !== !!d.eventRegistrationId,
  { message: "Exactly one of bookingId or eventRegistrationId is required" }
);

export const POST = withIdempotency(async ({ req, user }) => {
  const body = await parseJsonBody(req, createPaymentSchema);

  return await db.transaction(async (tx) => {
    let amountNaira = 0;

    if (body.bookingId) {
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
      if (booking.clientId !== user.id) {
        throw new ApiError("FORBIDDEN", "You cannot pay for another user's booking");
      }
      if (booking.status !== "pending_payment") {
        throw new ApiError("CONFLICT", `Booking is already ${booking.status}`);
      }
      amountNaira = booking.totalAmountNaira;

      const [payment] = await tx
        .insert(payments)
        .values({
          userId: user.id,
          bookingId: booking.id,
          amountNaira,
          provider: body.provider,
          providerRef: body.providerRef,
          status: "pending",
        })
        .returning();

      // NOTE: confirmation flips to "confirmed" only after the provider webhook
      // verifies the transaction. Webhook handler is a separate task.
      return { data: { payment }, status: 201 } as const;
    }

    // Event registration payment flow — minimal stub; tighten in event route.
    const [payment] = await tx
      .insert(payments)
      .values({
        userId: user.id,
        eventRegistrationId: body.eventRegistrationId!,
        amountNaira,
        provider: body.provider,
        providerRef: body.providerRef,
        status: "pending",
      })
      .returning();
    return { data: { payment }, status: 201 } as const;
  });
});
