import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { trainingSessions, users, bookings, services } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";
import { notifySessionCompleted } from "@/lib/email/notify";

export const POST = withAuth(async ({ user, params }) => {
  const sessionId = uuidSchema.parse(params.id);

  const [session] = await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.id, sessionId))
    .limit(1);

  if (!session) {
    throw new ApiError("NOT_FOUND", "Session not found");
  }

  // Verify that the logged-in trainer is assigned to this session
  if (session.trainerId !== user.id) {
    throw new ApiError("FORBIDDEN", "You are not assigned to this session");
  }

  const [updated] = await db
    .update(trainingSessions)
    .set({
      trainerCheckedInAt: new Date(),
      status: "completed", // Completing session on trainer check-in
      updatedAt: new Date(),
    })
    .where(eq(trainingSessions.id, sessionId))
    .returning();

  // Resolve client info + service name for notification
  const [info] = await db
    .select({
      clientEmail: users.email,
      clientName: users.fullName,
      serviceName: services.name,
    })
    .from(trainingSessions)
    .innerJoin(users, eq(users.id, trainingSessions.clientId))
    .innerJoin(bookings, eq(bookings.id, trainingSessions.bookingId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .where(eq(trainingSessions.id, sessionId))
    .limit(1);

  if (info) {
    notifySessionCompleted({
      clientEmail: info.clientEmail,
      clientName: info.clientName,
      trainerName: user.fullName,
      serviceName: info.serviceName,
      scheduledAt: session.scheduledAt,
    });
  }

  return { data: { session: updated } };
}, { roles: ["trainer"] });

