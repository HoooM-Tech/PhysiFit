import { sql } from "drizzle-orm";
import { pgTable, uuid, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { trainingSessions } from "./training-sessions";

export const sessionReschedules = pgTable(
  "session_reschedules",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    requestedById: uuid("requested_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fromScheduledAt: timestamp("from_scheduled_at", { withTimezone: true }).notNull(),
    toScheduledAt: timestamp("to_scheduled_at", { withTimezone: true }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sessionIdx: index("session_reschedules_session_idx").on(t.sessionId),
  })
);

export type SessionReschedule = typeof sessionReschedules.$inferSelect;
export type NewSessionReschedule = typeof sessionReschedules.$inferInsert;
