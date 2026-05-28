import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { trainingSessions, sessionReschedules, users, bookings, services } from "@/db/schema";
import { withIdempotency } from "@/lib/api/handler";
import { parseJsonBody, uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { notifySessionRescheduled } from "@/lib/email/notify";

const rescheduleSchema = z.object({
  toScheduledAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
});

// 24-hour notice rule: client cannot reschedule a session less than 24h before it starts.
// Admins bypass this guard.
const MIN_NOTICE_MS = 24 * 60 * 60 * 1000;

export const POST = withIdempotency(async ({ req, user, params }) => {
  const sessionId = uuidSchema.parse(params.id);
  const body = await parseJsonBody(req, rescheduleSchema);

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, sessionId))
      .limit(1);

    if (!session) throw new ApiError("NOT_FOUND", "Session not found");

    const isOwner = session.clientId === user.id;
    const isTrainer = session.trainerId === user.id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isTrainer && !isAdmin) {
      throw new ApiError("FORBIDDEN", "You cannot reschedule this session");
    }

    if (!isAdmin && session.scheduledAt.getTime() - Date.now() < MIN_NOTICE_MS) {
      throw new ApiError(
        "CONFLICT",
        "Reschedules require at least 24 hours notice. Contact support for exceptions."
      );
    }

    if (["completed", "cancelled", "missed"].includes(session.status)) {
      throw new ApiError("CONFLICT", `Cannot reschedule a ${session.status} session`);
    }

    const newAt = new Date(body.toScheduledAt);
    if (newAt.getTime() < Date.now()) {
      throw new ApiError("VALIDATION_ERROR", "New time must be in the future");
    }

    await tx.insert(sessionReschedules).values({
      sessionId,
      requestedById: user.id,
      fromScheduledAt: session.scheduledAt,
      toScheduledAt: newAt,
      reason: body.reason,
    });

    const [updated] = await tx
      .update(trainingSessions)
      .set({ scheduledAt: newAt, updatedAt: new Date() })
      .where(eq(trainingSessions.id, sessionId))
      .returning();

    return { updated, oldDate: session.scheduledAt, isOwner, isTrainer };
  });

  // Notify the other party about the reschedule
  const [info] = await db
    .select({
      clientId: trainingSessions.clientId,
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
    // If client rescheduled → notify trainer; if trainer rescheduled → notify client
    if (result.isOwner && result.updated.trainerId) {
      // Client rescheduled — notify trainer
      const [trainer] = await db
        .select({ email: users.email, fullName: users.fullName })
        .from(users)
        .where(eq(users.id, result.updated.trainerId))
        .limit(1);
      if (trainer) {
        notifySessionRescheduled({
          recipientEmail: trainer.email,
          recipientName: trainer.fullName,
          serviceName: info.serviceName,
          oldDate: result.oldDate,
          newDate: result.updated.scheduledAt,
          requestedByName: user.fullName,
          reason: body.reason,
        });
      }
    }
    if (result.isTrainer || (!result.isOwner && !result.isTrainer)) {
      // Trainer or admin rescheduled — notify client
      notifySessionRescheduled({
        recipientEmail: info.clientEmail,
        recipientName: info.clientName,
        serviceName: info.serviceName,
        oldDate: result.oldDate,
        newDate: result.updated.scheduledAt,
        requestedByName: user.fullName,
        reason: body.reason,
      });
    }
  }

  return { data: { session: result.updated } };
});
