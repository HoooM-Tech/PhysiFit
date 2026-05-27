import { sql } from "drizzle-orm";
import { pgTable, uuid, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    key: text("key").primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    route: text("route").notNull(),
    requestHash: text("request_hash").notNull(),
    responseStatus: integer("response_status").notNull(),
    responseBody: jsonb("response_body").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '24 hours'`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    expiresIdx: index("idempotency_keys_expires_idx").on(t.expiresAt),
  })
);

export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
