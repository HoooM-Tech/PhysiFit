import { sql } from "drizzle-orm";
import { pgTable, uuid, text, boolean, integer, date, timestamp, index } from "drizzle-orm/pg-core";
import { events } from "./events";

export const eventParqSubmissions = pgTable(
  "event_parq_submissions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),

    // Contact / identity
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull(),
    address: text("address").notNull(),
    dateOfBirth: date("date_of_birth").notNull(),

    // PAR-Q answers (true = yes)
    heartCondition: boolean("heart_condition").notNull(),
    chestPain: boolean("chest_pain").notNull(),
    dizzinessOrLossOfConsciousness: boolean("dizziness_or_loss_of_consciousness").notNull(),
    boneOrJointProblems: boolean("bone_or_joint_problems").notNull(),
    bpOrHeartMedication: boolean("bp_or_heart_medication").notNull(),
    informationCorrect: boolean("information_correct").notNull(),
    otherReasonsNotToExercise: boolean("other_reasons_not_to_exercise").notNull(),
    otherReasonsDetails: text("other_reasons_details"),

    // Acknowledgements & goals
    healthChangeAcknowledged: boolean("health_change_acknowledged").notNull(),
    additionalQuestions: text("additional_questions"),
    goals: text("goals").notNull(),
    plannedStartDate: date("planned_start_date").notNull(),
    seriousnessScore: integer("seriousness_score").notNull(),

    // Mailchimp sync state
    mailchimpSyncedAt: timestamp("mailchimp_synced_at", { withTimezone: true }),
    mailchimpSyncError: text("mailchimp_sync_error"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index("event_parq_submissions_email_idx").on(t.email),
    eventIdx: index("event_parq_submissions_event_idx").on(t.eventId),
    createdAtIdx: index("event_parq_submissions_created_at_idx").on(t.createdAt),
  })
);

export type EventParqSubmission = typeof eventParqSubmissions.$inferSelect;
export type NewEventParqSubmission = typeof eventParqSubmissions.$inferInsert;
