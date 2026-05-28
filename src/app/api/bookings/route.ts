import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  bookings,
  services,
  trainingSessions,
  timeSlotEnum,
  sessionTypeEnum,
} from "@/db/schema";
import { withAuth, withIdempotency } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { notifySessionBooked } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

// =============================================================================
// GET /api/bookings — list current user's bookings
// =============================================================================

export const GET = withAuth(async ({ user }) => {
  const rows = await db
    .select({
      id: bookings.id,
      serviceId: bookings.serviceId,
      serviceName: services.name,
      trainerId: bookings.trainerId,
      sessionType: bookings.sessionType,
      sessionCount: bookings.sessionCount,
      startDate: bookings.startDate,
      preferredTimeSlots: bookings.preferredTimeSlots,
      totalAmountNaira: bookings.totalAmountNaira,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .where(eq(bookings.clientId, user.id))
    .orderBy(desc(bookings.createdAt));

  return { data: { bookings: rows } };
});

// =============================================================================
// POST /api/bookings — create a new booking (idempotent)
// =============================================================================

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  sessionType: z.enum(sessionTypeEnum.enumValues),
  sessionCount: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(12)]),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  preferredTimeSlots: z.array(z.enum(timeSlotEnum.enumValues)).min(1).max(4),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export const POST = withIdempotency(async ({ req, user }) => {
  const body = await parseJsonBody(req, createBookingSchema);

  // Lock-step: load service, compute amount, create booking + N training sessions
  // — all in one transaction so a half-state is impossible.
  const result = await db.transaction(async (tx) => {
    const [svc] = await tx
      .select({
        id: services.id,
        name: services.name,
        priceNairaPerSession: services.priceNairaPerSession,
        active: services.active,
      })
      .from(services)
      .where(eq(services.id, body.serviceId))
      .limit(1);

    if (!svc || !svc.active) {
      throw new ApiError("NOT_FOUND", "Service not found or unavailable");
    }

    // For a physical assessment booking, force session_count = 1 (it's a single visit).
    const sessionCount =
      body.sessionType === "physical_assessment" ? 1 : body.sessionCount;
    const totalAmountNaira = svc.priceNairaPerSession * sessionCount;

    const [booking] = await tx
      .insert(bookings)
      .values({
        clientId: user.id,
        serviceId: svc.id,
        sessionType: body.sessionType,
        sessionCount,
        startDate: body.startDate,
        preferredTimeSlots: body.preferredTimeSlots,
        totalAmountNaira,
        status: "pending_payment",
        termsAcceptedAt: new Date(),
      })
      .returning();

    if (!booking) throw new ApiError("INTERNAL_ERROR", "Failed to create booking");

    // Pre-create N placeholder training sessions, all at start_date 09:00 local.
    // Trainer + final times are assigned later by an admin/scheduling task.
    const initialAt = new Date(`${body.startDate}T09:00:00.000Z`);
    const placeholders = Array.from({ length: sessionCount }, (_, i) => {
      const dt = new Date(initialAt);
      dt.setUTCDate(dt.getUTCDate() + i * 2); // every other day; admin will reschedule
      return {
        bookingId: booking.id,
        clientId: user.id,
        scheduledAt: dt,
        status:
          body.sessionType === "physical_assessment" && i === 0
            ? ("assessment" as const)
            : ("upcoming" as const),
      };
    });
    await tx.insert(trainingSessions).values(placeholders);

    return { booking, serviceName: svc.name, sessionCount, totalAmountNaira };
  });

  // Email notification — fire-and-forget
  notifySessionBooked({
    clientEmail: user.email,
    clientName: user.fullName,
    serviceName: result.serviceName,
    sessionCount: result.sessionCount,
    startDate: body.startDate,
    totalAmountNaira: result.totalAmountNaira,
  });

  return {
    data: {
      booking: result.booking,
    },
    status: 201,
  };
});
