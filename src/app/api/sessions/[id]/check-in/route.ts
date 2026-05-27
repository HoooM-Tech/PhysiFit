import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { trainingSessions } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";

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

  return { data: { session: updated } };
}, { roles: ["trainer"] });
