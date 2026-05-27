import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { trainingSessions, sessionReschedules } from "@/db/schema";
import { withIdempotency } from "@/lib/api/handler";
import { parseJsonBody, uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

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

    return updated;
  });

  return { data: { session: result } };
});
