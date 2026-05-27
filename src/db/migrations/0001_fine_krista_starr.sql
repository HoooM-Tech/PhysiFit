CREATE TABLE IF NOT EXISTS "event_parq_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"country" text NOT NULL,
	"address" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"heart_condition" boolean NOT NULL,
	"chest_pain" boolean NOT NULL,
	"dizziness_or_loss_of_consciousness" boolean NOT NULL,
	"bone_or_joint_problems" boolean NOT NULL,
	"bp_or_heart_medication" boolean NOT NULL,
	"information_correct" boolean NOT NULL,
	"other_reasons_not_to_exercise" boolean NOT NULL,
	"other_reasons_details" text,
	"health_change_acknowledged" boolean NOT NULL,
	"additional_questions" text,
	"goals" text NOT NULL,
	"planned_start_date" date NOT NULL,
	"seriousness_score" integer NOT NULL,
	"mailchimp_synced_at" timestamp with time zone,
	"mailchimp_sync_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_parq_submissions" ADD CONSTRAINT "event_parq_submissions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_parq_submissions_email_idx" ON "event_parq_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_parq_submissions_event_idx" ON "event_parq_submissions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_parq_submissions_created_at_idx" ON "event_parq_submissions" USING btree ("created_at");