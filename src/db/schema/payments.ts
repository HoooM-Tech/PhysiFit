import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { bookings } from "./bookings";
import { paymentStatusEnum } from "./enums";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    // event_registration_id added later in registrations file via FK from that side; we keep this
    // as an opaque text reference to avoid a circular dependency.
    eventRegistrationId: uuid("event_registration_id"),
    amountNaira: integer("amount_naira").notNull(),
    currency: text("currency").notNull().default("NGN"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    provider: text("provider"),
    providerRef: text("provider_ref"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userStatusIdx: index("payments_user_status_idx").on(t.userId, t.status),
    providerRefIdx: index("payments_provider_ref_idx").on(t.providerRef),
    idemKeyUnique: uniqueIndex("payments_idempotency_key_unique")
      .on(t.idempotencyKey)
      .where(sql`${t.idempotencyKey} is not null`),
  })
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
