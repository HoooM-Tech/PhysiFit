import { sql } from "drizzle-orm";
import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { fitnessPlanStatusEnum } from "./enums";

export type FitnessExercise = {
  name: string;
  sets: number;
  reps: number;
  focus: "strength" | "balance" | "mobility" | "core" | "cardio";
};

export const fitnessPlans = pgTable(
  "fitness_plans",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    notes: text("notes"),
    exercises: jsonb("exercises")
      .$type<FitnessExercise[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: fitnessPlanStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clientStatusIdx: index("fitness_plans_client_status_idx").on(t.clientId, t.status),
  })
);

export type FitnessPlan = typeof fitnessPlans.$inferSelect;
export type NewFitnessPlan = typeof fitnessPlans.$inferInsert;
