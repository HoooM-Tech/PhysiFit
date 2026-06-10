import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { z } from "zod";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { verifyPassword, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const POST = withAuth(async ({ req, user }) => {
  const body = await parseJsonBody(req, changePasswordSchema);

  // Fetch current user details including password hash
  const [currentUser] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!currentUser) {
    throw new ApiError("NOT_FOUND", "User not found");
  }

  // Verify current password
  const isValid = await verifyPassword(body.currentPassword, currentUser.passwordHash);
  if (!isValid) {
    throw new ApiError("VALIDATION_ERROR", "Incorrect current password");
  }

  // Hash and save new password
  const newPasswordHash = await hashPassword(body.newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { data: { success: true } };
});
