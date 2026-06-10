import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { createHash, randomUUID } from "crypto";
import { db } from "@/db/client";
import { authSessions, idempotencyKeys, users, type User } from "@/db/schema";
import { env } from "@/lib/env";
import { ApiError, errorResponse, successResponse } from "./errors";
import { getClientIp } from "./rate-limit";

// =============================================================================
// Types
// =============================================================================

export type RouteCtx = {
  req: NextRequest;
  requestId: string;
  params: Record<string, string>;
};

export type AuthedRouteCtx = RouteCtx & {
  user: Pick<User, "id" | "email" | "role" | "fullName">;
  sessionId: string;
};

export type HandlerResult<T> = { data: T; status?: number } | NextResponse;
export type CoreHandler<T> = (ctx: RouteCtx) => Promise<HandlerResult<T>>;
export type AuthedHandler<T> = (ctx: AuthedRouteCtx) => Promise<HandlerResult<T>>;

type NextRouteContext = { params: Record<string, string> | Promise<Record<string, string>> };

function finalizeResult<T>(result: HandlerResult<T>, requestId: string): NextResponse {
  if (result instanceof NextResponse) {
    result.headers.set("x-request-id", requestId);
    return result;
  }
  const res = successResponse(result.data, requestId, result.status ?? 200);
  res.headers.set("x-request-id", requestId);
  return res;
}

// =============================================================================
// withRoute — every API route is wrapped at least once
// =============================================================================

export function withRoute<T>(handler: CoreHandler<T>) {
  return async (req: NextRequest, ctx?: NextRouteContext): Promise<NextResponse> => {
    const requestId = randomUUID();
    try {
      const params = ctx?.params ? await ctx.params : {};
      const result = await handler({ req, requestId, params });
      return finalizeResult(result, requestId);
    } catch (err) {
      const res = errorResponse(err, requestId);
      res.headers.set("x-request-id", requestId);
      return res;
    }
  };
}

// =============================================================================
// withAuth — session + inactivity enforcement
//
// All in one transaction:
//   1. Load session by token hash
//   2. Reject if expired
//   3. Reject if (now - last_seen_at) > inactivity timeout, AND delete the session
//   4. Update last_seen_at to now
//   5. Return the user
// =============================================================================

const SESSION_COOKIE = "physifit_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function readSessionToken(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export { hashToken };

export function withAuth<T>(
  handler: AuthedHandler<T>,
  opts: { roles?: Array<"client" | "trainer" | "admin" | "super_admin"> } = {}
) {
  return withRoute<T>(async (ctx) => {
    const token = readSessionToken(ctx.req);
    if (!token) {
      throw new ApiError("UNAUTHENTICATED", "Authentication required");
    }
    const tokenHash = hashToken(token);
    const timeoutSec = env.SESSION_INACTIVITY_TIMEOUT_SECONDS;

    // Single transaction: load + validate + touch
    const authed = await db.transaction(async (tx) => {
      const [row] = await tx
        .select({
          sessionId: authSessions.id,
          userId: authSessions.userId,
          expiresAt: authSessions.expiresAt,
          lastSeenAt: authSessions.lastSeenAt,
          userEmail: users.email,
          userRole: users.role,
          userFullName: users.fullName,
          userStatus: users.status,
        })
        .from(authSessions)
        .innerJoin(users, eq(users.id, authSessions.userId))
        .where(eq(authSessions.tokenHash, tokenHash))
        .limit(1);

      if (!row) {
        throw new ApiError("UNAUTHENTICATED", "Invalid or revoked session");
      }
      if (row.userStatus !== "active") {
        await tx.delete(authSessions).where(eq(authSessions.id, row.sessionId));
        throw new ApiError("FORBIDDEN", "Account is inactive");
      }
      if (row.expiresAt.getTime() < Date.now()) {
        await tx.delete(authSessions).where(eq(authSessions.id, row.sessionId));
        throw new ApiError("SESSION_EXPIRED", "Session has expired. Please sign in again.");
      }
      const inactiveSec = (Date.now() - row.lastSeenAt.getTime()) / 1000;
      if (inactiveSec > timeoutSec) {
        await tx.delete(authSessions).where(eq(authSessions.id, row.sessionId));
        throw new ApiError(
          "SESSION_EXPIRED",
          `Signed out after ${Math.round(timeoutSec / 60)} minutes of inactivity.`
        );
      }
      // Touch last_seen_at
      await tx
        .update(authSessions)
        .set({ lastSeenAt: sql`now()` })
        .where(eq(authSessions.id, row.sessionId));

      return {
        sessionId: row.sessionId,
        user: {
          id: row.userId,
          email: row.userEmail,
          role: row.userRole,
          fullName: row.userFullName,
        },
      };
    });

    if (opts.roles && !opts.roles.includes(authed.user.role)) {
      throw new ApiError("FORBIDDEN", "You do not have permission to perform this action");
    }

    return handler({ ...ctx, user: authed.user, sessionId: authed.sessionId });
  });
}

// =============================================================================
// withIdempotency — claim key, run handler, persist response
//
// Behavior:
//   - Missing Idempotency-Key on a mutation -> 400 IDEMPOTENCY_KEY_REQUIRED
//   - Key exists with SAME request body -> replay cached response
//   - Key exists with DIFFERENT request body -> 409 IDEMPOTENCY_CONFLICT
//   - First request with key -> claim, run handler, store result for 24h
// =============================================================================

function hashBody(body: unknown): string {
  return createHash("sha256")
    .update(typeof body === "string" ? body : JSON.stringify(body))
    .digest("hex");
}

export function withIdempotency<T>(
  handler: AuthedHandler<T>,
  opts: { roles?: Array<"client" | "trainer" | "admin" | "super_admin"> } = {}
) {
  return withAuth<T>(async (ctx) => {
    const key = ctx.req.headers.get("idempotency-key");
    if (!key) {
      throw new ApiError(
        "IDEMPOTENCY_KEY_REQUIRED",
        "This endpoint requires an `Idempotency-Key` header (UUID recommended)."
      );
    }

    // Snapshot body — handler may also need to read it, so re-clone the request.
    const bodyText = await ctx.req.text();
    const requestHash = hashBody(bodyText);
    const cloned = new NextRequest(ctx.req.url, {
      method: ctx.req.method,
      headers: ctx.req.headers,
      body: bodyText || undefined,
    });

    // Try to claim the key with a sentinel result (status=0).
    const claimed = await db
      .insert(idempotencyKeys)
      .values({
        key,
        userId: ctx.user.id,
        route: new URL(ctx.req.url).pathname,
        requestHash,
        responseStatus: 0,
        responseBody: {},
      })
      .onConflictDoNothing({ target: idempotencyKeys.key })
      .returning({ key: idempotencyKeys.key });

    if (claimed.length === 0) {
      // Key already exists — replay or conflict.
      const [existing] = await db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.key, key))
        .limit(1);

      if (!existing) {
        throw new ApiError("INTERNAL_ERROR", "Idempotency state lost. Retry.");
      }
      if (existing.requestHash !== requestHash) {
        throw new ApiError(
          "IDEMPOTENCY_CONFLICT",
          "This Idempotency-Key was used with a different request body."
        );
      }
      if (existing.responseStatus === 0) {
        // In-flight — caller should retry shortly. 409 with hint.
        throw new ApiError(
          "IDEMPOTENCY_CONFLICT",
          "A previous request with this key is still processing. Retry in a moment."
        );
      }
      // Replay
      return {
        data: (existing.responseBody as { data: T }).data,
        status: existing.responseStatus,
      };
    }

    // Claim succeeded — run the handler.
    let result: HandlerResult<T>;
    try {
      result = await handler({ ...ctx, req: cloned });
    } catch (err) {
      // Roll back the claim so the client can retry. ApiErrors are not cached.
      await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
      throw err;
    }

    if (result instanceof NextResponse) {
      // Idempotent endpoints must return serializable data, not raw responses.
      // Returning a raw NextResponse from a mutating endpoint is a programming bug.
      await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
      throw new ApiError(
        "INTERNAL_ERROR",
        "Idempotent handlers must return {data, status}, not a raw NextResponse"
      );
    }

    const status = result.status ?? 200;
    await db
      .update(idempotencyKeys)
      .set({
        responseStatus: status,
        responseBody: { data: result.data },
      })
      .where(eq(idempotencyKeys.key, key));

    return result;
  }, opts);
}

// =============================================================================
// Helpers for routes that need request metadata
// =============================================================================

export function getRequestMeta(req: NextRequest) {
  return {
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent") ?? null,
  };
}
