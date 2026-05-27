import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { withRoute, setSessionCookie, getRequestMeta } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError, successResponse } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { env } from "@/lib/env";
import { verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(200),
});

export const POST = withRoute(async ({ req, requestId }) => {
  const ip = getClientIp(req);

  // Two rate-limit buckets: per-IP (broad) and per-email (targeted credential stuffing).
  // Bucket on email BEFORE parsing the body? We need the body first, but we already
  // enforce IP limit first to slow scanners.
  await enforceRateLimit({
    bucket: `ip:${ip}:login`,
    max: env.RATE_LIMIT_AUTH_PER_MINUTE,
    windowSeconds: 60,
  });

  const body = await parseJsonBody(req, loginSchema);

  await enforceRateLimit({
    bucket: `email:${body.email}:login`,
    max: env.RATE_LIMIT_AUTH_PER_MINUTE,
    windowSeconds: 60,
  });

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      passwordHash: users.passwordHash,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  // Generic error to prevent user enumeration. Constant-time-ish by always running
  // argon verify against a real hash when user exists.
  const valid = user ? await verifyPassword(body.password, user.passwordHash) : false;
  if (!user || !valid) {
    throw new ApiError("UNAUTHENTICATED", "Invalid email or password");
  }
  if (user.status !== "active") {
    throw new ApiError("FORBIDDEN", "Account is inactive");
  }

  const { token, expiresAt } = await createSession(user.id, getRequestMeta(req));

  const res = successResponse(
    {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
    requestId
  );
  setSessionCookie(res, token, expiresAt);
  return res;
});
