import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  integer,
  date,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { services } from "./services";
import { sessionTypeEnum, bookingStatusEnum, timeSlotEnum } from "./enums";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    trainerId: uuid("trainer_id").references(() => users.id, { onDelete: "set null" }),
    sessionType: sessionTypeEnum("session_type").notNull(),
    sessionCount: integer("session_count").notNull(),
    startDate: date("start_date").notNull(),
    preferredTimeSlots: jsonb("preferred_time_slots")
      .$type<Array<(typeof timeSlotEnum.enumValues)[number]>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    totalAmountNaira: integer("total_amount_naira").notNull(),
    status: bookingStatusEnum("status").notNull().default("pending_payment"),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clientStatusIdx: index("bookings_client_status_idx").on(t.clientId, t.status),
    trainerStatusIdx: index("bookings_trainer_status_idx").on(t.trainerId, t.status),
  })
);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
