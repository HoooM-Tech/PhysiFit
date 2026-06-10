import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, passwordResets, authSessions } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError, successResponse } from "@/lib/api/errors";
import { hashToken, hashPassword } from "@/lib/auth";

const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8).max(200) });

export const POST = withRoute(async ({ req, requestId }) => {
  const body = await parseJsonBody(req, resetSchema);
  const tokenHash = hashToken(body.token);

  const [pr] = await db
    .select({ id: passwordResets.id, userId: passwordResets.userId, used: passwordResets.used, expiresAt: passwordResets.expiresAt })
    .from(passwordResets)
    .where(eq(passwordResets.tokenHash, tokenHash))
    .limit(1);

  if (!pr || pr.used || pr.expiresAt.getTime() < Date.now()) {
    throw new ApiError('VALIDATION_ERROR', 'Invalid or expired reset token');
  }

  const newHash = await hashPassword(body.password);

  await db.transaction(async (tx) => {
    // Update user's password
    await tx.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, pr.userId));

    // Mark token used
    await tx.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, pr.id));

    // Revoke existing sessions for this user
    await tx.delete(authSessions).where(eq(authSessions.userId, pr.userId));
  });

  return successResponse({ success: true }, requestId);
});
