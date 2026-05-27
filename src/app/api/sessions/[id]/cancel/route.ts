import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { trainingSessions } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody, uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const POST = withAuth(async ({ req, user, params }) => {
  const sessionId = uuidSchema.parse(params.id);
  const body = await parseJsonBody(req, cancelSchema);

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, sessionId))
      .limit(1);

    if (!session) throw new ApiError("NOT_FOUND", "Session not found");

    // Authorization: trainer assigned to this session or admin
    const isTrainer = session.trainerId === user.id;
    const isAdmin = user.role === "admin";
    if (!isTrainer && !isAdmin) {
      throw new ApiError("FORBIDDEN", "You are not authorized to cancel this session");
    }

    // Cannot cancel already terminal sessions
    if (["completed", "cancelled", "missed"].includes(session.status)) {
      throw new ApiError("CONFLICT", `Cannot cancel a ${session.status} session`);
    }

    const [updated] = await tx
      .update(trainingSessions)
      .set({
        status: "cancelled",
        notes: body.reason
          ? `Cancelled by trainer: ${body.reason}`
          : "Cancelled by trainer",
        updatedAt: new Date(),
      })
      .where(eq(trainingSessions.id, sessionId))
      .returning();

    return updated;
  });

  return { data: { session: result } };
}, { roles: ["trainer", "admin"] });
