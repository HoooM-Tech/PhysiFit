import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const rateLimits = pgTable("rate_limits", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
