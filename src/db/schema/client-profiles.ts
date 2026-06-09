import { sql } from "drizzle-orm";
import { pgTable, uuid, integer, boolean, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { trainerSpecializationEnum } from "./enums";
import { users } from "./users";

export const clientProfiles = pgTable(
  "client_profiles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weightKg: integer("weight_kg"),
    heightCm: integer("height_cm"),
    dizzinessHistory: boolean("dizziness_history").notNull().default(false),
    medicalNotes: text("medical_notes"),
    preferredSpecialization: trainerSpecializationEnum("preferred_specialization"),
    assignedTrainerId: uuid("assigned_trainer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userUnique: uniqueIndex("client_profiles_user_unique").on(t.userId),
  })
);

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
