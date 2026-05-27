import { sql } from "drizzle-orm";
import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    priceNairaPerSession: integer("price_naira_per_session").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex("services_slug_unique").on(t.slug),
  })
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
