import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["client", "trainer", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const trainerSpecializationEnum = pgEnum("trainer_specialization", [
  "senior_fitness",
  "postpartum",
  "corporate_wellness",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "physical_assessment",
  "one_on_one",
  "group",
]);
export const timeSlotEnum = pgEnum("time_slot", ["morning", "midday", "afternoon", "evening"]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "cancelled",
  "completed",
]);

export const trainingSessionStatusEnum = pgEnum("training_session_status", [
  "upcoming",
  "assessment",
  "completed",
  "missed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "failed",
  "refunded",
]);

export const fitnessPlanStatusEnum = pgEnum("fitness_plan_status", ["active", "archived"]);
