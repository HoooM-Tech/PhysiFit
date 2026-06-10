import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, passwordResets } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError, successResponse } from "@/lib/api/errors";
import { generateSessionToken, hashToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";

const forgotSchema = z.object({ email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()) });

export const POST = withRoute(async ({ req, requestId }) => {
  const body = await parseJsonBody(req, forgotSchema);

  const [user] = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName, status: users.status })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  // Always return success to avoid email enumeration. If user exists and active, create a token.
  if (user && user.status === 'active') {
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(passwordResets).values({ userId: user.id, tokenHash, expiresAt });

    const publicUrl = env.PUBLIC_APP_URL && !env.PUBLIC_APP_URL.includes('localhost') ? env.PUBLIC_APP_URL : 'https://physifit.co'
    const resetUrl = publicUrl + `/reset-password/${token}`;

    // send email (fire-and-forget)
    sendEmail({
      to: user.email,
      subject: 'Reset your PhysiFit password',
      html: passwordResetEmail(user.fullName ?? null, resetUrl),
    }).catch(console.error);
  }

  return successResponse({ message: 'If an account with this email exists, a reset link has been sent.' }, requestId);
});
