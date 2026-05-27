import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { eventParqSubmissions } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { env } from "@/lib/env";
import { isMailchimpConfigured, upsertMailchimpMember } from "@/lib/mailchimp";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const submissionSchema = z.object({
  eventId: z.string().uuid().optional(),

  fullName: z.string().min(2).max(200).transform((s) => s.trim()),
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  phone: z.string().min(5).max(40).transform((s) => s.trim()),
  country: z.string().min(2).max(80).transform((s) => s.trim()),
  address: z.string().min(3).max(500).transform((s) => s.trim()),
  dateOfBirth: isoDate,

  heartCondition: z.boolean(),
  chestPain: z.boolean(),
  dizzinessOrLossOfConsciousness: z.boolean(),
  boneOrJointProblems: z.boolean(),
  bpOrHeartMedication: z.boolean(),
  informationCorrect: z.boolean(),
  otherReasonsNotToExercise: z.boolean(),
  otherReasonsDetails: z.string().max(2000).optional(),

  healthChangeAcknowledged: z.boolean(),
  additionalQuestions: z.string().max(2000).optional(),
  goals: z.string().min(1).max(2000).transform((s) => s.trim()),
  plannedStartDate: isoDate,
  seriousnessScore: z.number().int().min(1).max(10),
});

function buildTags(s: z.infer<typeof submissionSchema>): string[] {
  const tags: string[] = ["event-parq"];
  const flagged =
    s.heartCondition ||
    s.chestPain ||
    s.dizzinessOrLossOfConsciousness ||
    s.boneOrJointProblems ||
    s.bpOrHeartMedication ||
    s.otherReasonsNotToExercise ||
    !s.informationCorrect;
  if (flagged) tags.push("parq-flagged");
  if (s.seriousnessScore >= 8) tags.push("high-intent");
  return tags;
}

export const POST = withRoute(async ({ req, requestId }) => {
  await enforceRateLimit({
    bucket: `ip:${getClientIp(req)}:event-parq`,
    max: env.RATE_LIMIT_AUTH_PER_MINUTE,
    windowSeconds: 60,
  });

  const body = await parseJsonBody(req, submissionSchema);

  // Split first/last name for Mailchimp's FNAME/LNAME merge fields.
  const nameParts = body.fullName.split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const [inserted] = await db
    .insert(eventParqSubmissions)
    .values({
      eventId: body.eventId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      country: body.country,
      address: body.address,
      dateOfBirth: body.dateOfBirth,
      heartCondition: body.heartCondition,
      chestPain: body.chestPain,
      dizzinessOrLossOfConsciousness: body.dizzinessOrLossOfConsciousness,
      boneOrJointProblems: body.boneOrJointProblems,
      bpOrHeartMedication: body.bpOrHeartMedication,
      informationCorrect: body.informationCorrect,
      otherReasonsNotToExercise: body.otherReasonsNotToExercise,
      otherReasonsDetails: body.otherReasonsDetails,
      healthChangeAcknowledged: body.healthChangeAcknowledged,
      additionalQuestions: body.additionalQuestions,
      goals: body.goals,
      plannedStartDate: body.plannedStartDate,
      seriousnessScore: body.seriousnessScore,
    })
    .returning({ id: eventParqSubmissions.id });

  if (!inserted) {
    throw new ApiError("INTERNAL_ERROR", "Failed to save registration");
  }

  let mailchimpStatus: "synced" | "skipped" | "failed" = "skipped";

  if (isMailchimpConfigured()) {
    try {
      await upsertMailchimpMember({
        email: body.email,
        mergeFields: {
          FNAME: firstName,
          LNAME: lastName,
          PHONE: body.phone,
          COUNTRY: body.country,
          ADDRESS: body.address,
          DOB: body.dateOfBirth,
          GOALS: body.goals.slice(0, 200),
          STARTDATE: body.plannedStartDate,
          INTENT: body.seriousnessScore,
        },
        tags: buildTags(body),
      });
      await db
        .update(eventParqSubmissions)
        .set({ mailchimpSyncedAt: new Date() })
        .where(eq(eventParqSubmissions.id, inserted.id));
      mailchimpStatus = "synced";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${requestId}] Mailchimp sync failed:`, message);
      await db
        .update(eventParqSubmissions)
        .set({ mailchimpSyncError: message.slice(0, 1000) })
        .where(eq(eventParqSubmissions.id, inserted.id));
      mailchimpStatus = "failed";
    }
  }

  return {
    data: { id: inserted.id, mailchimp: mailchimpStatus },
    status: 201,
  };
});
