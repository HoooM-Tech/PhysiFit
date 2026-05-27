import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Node runtime needs a WebSocket implementation (not present natively).
// In Vercel Edge or browser this is skipped automatically.
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// Single pool per cold start, reused across requests in the same lambda instance.
const globalForDb = globalThis as unknown as { __pool?: Pool };
const pool =
  globalForDb.__pool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 1, // serverless: one connection per lambda; Neon's pgbouncer handles fan-out
  });
if (env.NODE_ENV !== "production") globalForDb.__pool = pool;

export const db = drizzle(pool, { schema, logger: env.NODE_ENV === "development" });
export type Db = typeof db;
export { schema, pool };
