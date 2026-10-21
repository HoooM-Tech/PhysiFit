import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, clientProfiles, trainerProfiles, trainerSpecializationEnum } from "@/db/schema";
import { withRoute, setSessionCookie, getRequestMeta } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError, successResponse } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { env } from "@/lib/env";
import { hashPassword, createSession } from "@/lib/auth";
import { notifyNewRegistration } from "@/lib/email/notify";

const registerSchema = z
  .object({
    email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
    password: z.string().min(8, "Password must be at least 8 characters").max(200),
    fullName: z.string().min(2).max(100).transform((s) => s.trim()),
    phone: z.string().min(7).max(20).optional(),
    role: z.enum(["client", "trainer"]).default("client"),
    specialization: z.enum(trainerSpecializationEnum.enumValues).optional(),
    weightKg: z.number().int().positive().optional(),
    heightCm: z.number().int().positive().optional(),
    dizzinessHistory: z.boolean().optional(),
    medicalNotes: z.string().max(2000).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    yearsOfExperience: z.number().int().nonnegative().optional(),
    cvUrl: z.string().optional(),
    certifications: z.string().optional(),
    education: z.string().optional(),
    onboardingAnswers: z.string().optional(),
    parq: z
      .object({
        heartCondition: z.boolean().optional(),
        chestPain: z.boolean().optional(),
        dizzinessOrLossOfConsciousness: z.boolean().optional(),
        boneOrJointProblems: z.boolean().optional(),
        bpOrHeartMedication: z.boolean().optional(),
        informationCorrect: z.boolean().optional(),
        otherReasonsNotToExercise: z.boolean().optional(),
        otherReasonsDetails: z.string().max(2000).optional(),
        healthChangeAcknowledged: z.boolean().optional(),
        additionalQuestions: z.string().max(2000).optional(),
      })
      .optional(),
  })
  .refine((d) => d.role !== "trainer" || !!d.specialization, {
    message: "Trainers must specify a specialization",
    path: ["specialization"],
  });

export const POST = withRoute(async ({ req, requestId }) => {
  await enforceRateLimit({
    bucket: `ip:${getClientIp(req)}:register`,
    max: env.RATE_LIMIT_AUTH_PER_MINUTE,
    windowSeconds: 60,
  });

  const body = await parseJsonBody(req, registerSchema);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);
  if (existing) {
    // Generic message so we don't leak which emails exist.
    throw new ApiError("CONFLICT", "An account with these details already exists");
  }

  const passwordHash = await hashPassword(body.password);

  const newUser = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        email: body.email,
        passwordHash,
        fullName: body.fullName,
        phone: body.phone,
        role: body.role,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
      })
      .returning({
        id: users.id,
        role: users.role,
        email: users.email,
        fullName: users.fullName,
      });

    if (!u) throw new ApiError("INTERNAL_ERROR", "Failed to create account");

    if (body.role === "client") {
      let dizzinessHistory = body.dizzinessHistory ?? false;
      let medicalNotes = body.medicalNotes;

      if (body.parq) {
        const parq = body.parq;
        if (parq.dizzinessOrLossOfConsciousness !== undefined) {
          dizzinessHistory = parq.dizzinessOrLossOfConsciousness;
        }

        const flags: string[] = [];
        if (parq.heartCondition) flags.push("Heart Condition");
        if (parq.chestPain) flags.push("Chest Pain");
        if (parq.dizzinessOrLossOfConsciousness) flags.push("Dizziness/Loss of Balance");
        if (parq.boneOrJointProblems) flags.push("Bone/Joint Issues");
        if (parq.bpOrHeartMedication) flags.push("BP/Heart Medication");
        if (parq.otherReasonsNotToExercise && parq.otherReasonsDetails) {
          flags.push(`Other: ${parq.otherReasonsDetails.trim()}`);
        }

        const parqSummary = flags.length > 0
          ? `PAR-Q Flagged Conditions: ${flags.join("; ")}${parq.additionalQuestions ? ` | Notes: ${parq.additionalQuestions.trim()}` : ""}`
          : `PAR-Q Cleared (All No)${parq.additionalQuestions ? ` | Notes: ${parq.additionalQuestions.trim()}` : ""}`;

        medicalNotes = medicalNotes || parqSummary;
      }

      await tx.insert(clientProfiles).values({
        userId: u.id,
        weightKg: body.weightKg,
        heightCm: body.heightCm,
        dizzinessHistory,
        medicalNotes,
        preferredSpecialization: body.specialization ?? null,
      });
    } else if (body.role === "trainer") {
      await tx.insert(trainerProfiles).values({
        userId: u.id,
        specialization: body.specialization!,
        yearsOfExperience: body.yearsOfExperience,
        cvUrl: body.cvUrl,
        certifications: body.certifications,
        education: body.education,
        onboardingAnswers: body.onboardingAnswers,
      });
    }
    return u;
  });

  // Email notification — fire-and-forget, never blocks response
  notifyNewRegistration({ fullName: newUser.fullName, email: newUser.email, role: newUser.role });

  const { token, expiresAt } = await createSession(newUser.id, getRequestMeta(req));

  const res = successResponse(
    {
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    },
    requestId,
    201
  );
  setSessionCookie(res, token, expiresAt);
  return res;
});
