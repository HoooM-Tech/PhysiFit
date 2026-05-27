import { sql } from "drizzle-orm";
import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { events } from "./events";
import { payments } from "./payments";

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    accessPassSentAt: timestamp("access_pass_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    eventUserUnique: uniqueIndex("event_registrations_event_user_unique").on(t.eventId, t.userId),
  })
);

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
