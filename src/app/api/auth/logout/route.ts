import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { authSessions } from "@/db/schema";
import {
  withRoute,
  clearSessionCookie,
  readSessionToken,
  hashToken,
} from "@/lib/api/handler";
import { successResponse } from "@/lib/api/errors";

export const POST = withRoute(async ({ req, requestId }) => {
  const token = readSessionToken(req);
  if (token) {
    await db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(token)));
  }
  const res = successResponse({ ok: true }, requestId);
  clearSessionCookie(res);
  return res;
});
