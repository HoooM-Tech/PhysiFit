import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings, services, trainingSessions } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

export const GET = withAuth(async ({ user, params }) => {
  const id = uuidSchema.parse(params.id);

  const [row] = await db
    .select({
      id: bookings.id,
      clientId: bookings.clientId,
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
    .where(eq(bookings.id, id))
    .limit(1);

  if (!row) throw new ApiError("NOT_FOUND", "Booking not found");

  // Authorization: client owns it, trainer assigned to it, or admin
  const isOwner = row.clientId === user.id;
  const isTrainer = row.trainerId === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isTrainer && !isAdmin) {
    throw new ApiError("FORBIDDEN", "You do not have access to this booking");
  }

  const sessions = await db
    .select({
      id: trainingSessions.id,
      scheduledAt: trainingSessions.scheduledAt,
      status: trainingSessions.status,
      trainerCheckedInAt: trainingSessions.trainerCheckedInAt,
      clientAttendedAt: trainingSessions.clientAttendedAt,
    })
    .from(trainingSessions)
    .where(eq(trainingSessions.bookingId, row.id))
    .orderBy(trainingSessions.scheduledAt);

  return { data: { booking: row, sessions } };
});
