import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { bookings } from "./bookings";
import { trainingSessionStatusEnum } from "./enums";

export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    trainerId: uuid("trainer_id").references(() => users.id, { onDelete: "set null" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: trainingSessionStatusEnum("status").notNull().default("upcoming"),
    trainerCheckedInAt: timestamp("trainer_checked_in_at", { withTimezone: true }),
    clientAttendedAt: timestamp("client_attended_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clientScheduledIdx: index("training_sessions_client_scheduled_idx").on(t.clientId, t.scheduledAt),
    trainerScheduledIdx: index("training_sessions_trainer_scheduled_idx").on(t.trainerId, t.scheduledAt),
    statusScheduledIdx: index("training_sessions_status_scheduled_idx").on(t.status, t.scheduledAt),
  })
);

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type NewTrainingSession = typeof trainingSessions.$inferInsert;
