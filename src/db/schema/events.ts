import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  time,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  venueRevealedOnRegister: boolean("venue_revealed_on_register").notNull().default(true),
  venueAddress: text("venue_address"),
  capacity: integer("capacity").notNull(),
  priceNaira: integer("price_naira").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
