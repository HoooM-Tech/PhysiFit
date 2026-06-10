import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PasswordReset = typeof passwordResets.$inferSelect;
