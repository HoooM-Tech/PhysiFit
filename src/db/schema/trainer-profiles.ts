import { sql } from "drizzle-orm";
import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { trainerSpecializationEnum } from "./enums";

export const trainerProfiles = pgTable(
  "trainer_profiles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    specialization: trainerSpecializationEnum("specialization").notNull(),
    bio: text("bio"),
    yearsOfExperience: integer("years_of_experience"),
    cvUrl: text("cv_url"),
    certifications: text("certifications"),
    education: text("education"),
    onboardingAnswers: text("onboarding_answers"),
    isOnline: boolean("is_online").notNull().default(false),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userUnique: uniqueIndex("trainer_profiles_user_unique").on(t.userId),
    specOnlineIdx: index("trainer_profiles_spec_online_idx").on(t.specialization, t.isOnline),
  })
);

export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type NewTrainerProfile = typeof trainerProfiles.$inferInsert;
