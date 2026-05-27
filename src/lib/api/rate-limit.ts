import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimits } from "@/db/schema";
import { ApiError } from "./errors";

export type RateLimitOptions = {
  /** Unique bucket key, e.g. "ip:1.2.3.4:auth-login" */
  bucket: string;
  /** Max requests per window */
  max: number;
  /** Window length in seconds */
  windowSeconds: number;
};

/**
 * Sliding-window rate limiter backed by Postgres.
 *
 * Atomically increments the bucket counter. If the current window has elapsed,
 * resets the counter to 1 and starts a new window. Throws RATE_LIMITED when
 * `count` exceeds `max` within the window.
 *
 * Trade-off: this costs ~1 DB round trip per request. For routes where that's
 * unacceptable, hoist this into middleware so it short-circuits before the
 * handler runs.
 */
export async function enforceRateLimit(opts: RateLimitOptions): Promise<void> {
  const { bucket, max, windowSeconds } = opts;
  const windowInterval = sql.raw(`interval '${windowSeconds} seconds'`);

  // UPSERT in one statement: if row is fresh, reset; otherwise increment.
  const result = await db.execute<{ count: number }>(sql`
    insert into ${rateLimits} (bucket, count, window_start)
    values (${bucket}, 1, now())
    on conflict (bucket) do update set
      count = case
        when now() - ${rateLimits.windowStart} > ${windowInterval} then 1
        else ${rateLimits.count} + 1
      end,
      window_start = case
        when now() - ${rateLimits.windowStart} > ${windowInterval} then now()
        else ${rateLimits.windowStart}
      end
    returning count
  `);

  const current = Number(result.rows[0]?.count ?? 0);
  if (current > max) {
    throw new ApiError(
      "RATE_LIMITED",
      `Too many requests. Try again in ${windowSeconds} seconds.`,
      { limit: max, windowSeconds }
    );
  }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
