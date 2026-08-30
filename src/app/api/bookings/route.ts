import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  bookings,
  services,
  trainingSessions,
  clientProfiles,
  eventParqSubmissions,
  users,
  timeSlotEnum,
  sessionTypeEnum,
} from "@/db/schema";
import { withAuth, withIdempotency } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

// =============================================================================
// GET /api/bookings — list current user's bookings
// =============================================================================

export const GET = withAuth(async ({ user }) => {
  const rows = await db
    .select({
      id: bookings.id,
      serviceId: bookings.serviceId,
      serviceName: services.name,
      trainerId: bookings.trainerId,
      sessionType: bookings.sessionType,
      sessionCount: bookings.sessionCount,
      startDate: bookings.startDate,
      preferredTimeSlots: bookings.preferredTimeSlots,
      totalAmountNaira: bookings.totalAmountNaira,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .where(eq(bookings.clientId, user.id))
    .orderBy(desc(bookings.createdAt));

  return { data: { bookings: rows } };
});

// =============================================================================
// POST /api/bookings — create a new booking (idempotent)
// =============================================================================

const parqSchema = z.object({
  heartCondition: z.boolean(),
  chestPain: z.boolean(),
  dizzinessOrLossOfConsciousness: z.boolean(),
  boneOrJointProblems: z.boolean(),
  bpOrHeartMedication: z.boolean(),
  informationCorrect: z.boolean(),
  otherReasonsNotToExercise: z.boolean(),
  otherReasonsDetails: z.string().optional(),
  healthChangeAcknowledged: z.boolean(),
  additionalQuestions: z.string().optional(),
});

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  sessionType: z.enum(sessionTypeEnum.enumValues),
  sessionCount: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(12)]),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  preferredTimeSlots: z.array(z.enum(timeSlotEnum.enumValues)).min(1).max(4),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
  parq: parqSchema.optional(),
});

export const POST = withIdempotency(async ({ req, user }) => {
  const body = await parseJsonBody(req, createBookingSchema);

  // Lock-step: load service, compute amount, create booking + N training sessions
  // — all in one transaction so a half-state is impossible.
  const result = await db.transaction(async (tx) => {
    const [svc] = await tx
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        priceNairaPerSession: services.priceNairaPerSession,
        active: services.active,
      })
      .from(services)
      .where(eq(services.id, body.serviceId))
      .limit(1);

    if (!svc || !svc.active) {
      throw new ApiError("NOT_FOUND", "Service not found or unavailable");
    }

    // For a physical assessment booking, force session_count = 1 (it's a single visit).
    const sessionCount =
      body.sessionType === "physical_assessment" ? 1 : body.sessionCount;
    const totalAmountNaira = svc.priceNairaPerSession * sessionCount;

    const [booking] = await tx
      .insert(bookings)
      .values({
        clientId: user.id,
        serviceId: svc.id,
        sessionType: body.sessionType,
        sessionCount,
        startDate: body.startDate,
        preferredTimeSlots: body.preferredTimeSlots,
        totalAmountNaira,
        status: "pending_payment",
        termsAcceptedAt: new Date(),
      })
      .returning();

    if (!booking) throw new ApiError("INTERNAL_ERROR", "Failed to create booking");

    // Process PAR-Q screening data if provided
    if (body.parq) {
      const parq = body.parq;
      const flags: string[] = [];
      if (parq.heartCondition) flags.push("Heart Condition");
      if (parq.chestPain) flags.push("Chest Pain");
      if (parq.dizzinessOrLossOfConsciousness) flags.push("Dizziness/Loss of Balance");
      if (parq.boneOrJointProblems) flags.push("Bone/Joint Issues");
      if (parq.bpOrHeartMedication) flags.push("BP/Heart Medication");
      if (parq.otherReasonsNotToExercise && parq.otherReasonsDetails) {
        flags.push(`Other: ${parq.otherReasonsDetails}`);
      }

      const medicalNotes = flags.length > 0
        ? `PAR-Q Flagged Conditions: ${flags.join("; ")}${parq.additionalQuestions ? ` | Notes: ${parq.additionalQuestions}` : ""}`
        : `PAR-Q Cleared (All No)${parq.additionalQuestions ? ` | Notes: ${parq.additionalQuestions}` : ""}`;

      let prefSpec: "postpartum" | "senior_fitness" | "corporate_wellness" | null = null;
      const slug = (svc.slug || svc.name).toLowerCase();
      if (slug.includes("postpartum")) {
        prefSpec = "postpartum";
      } else if (slug.includes("senior")) {
        prefSpec = "senior_fitness";
      } else if (slug.includes("corporate")) {
        prefSpec = "corporate_wellness";
      }

      // Upsert client profile
      const [existingProfile] = await tx
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, user.id))
        .limit(1);

      if (existingProfile) {
        await tx
          .update(clientProfiles)
          .set({
            dizzinessHistory: parq.dizzinessOrLossOfConsciousness,
            medicalNotes,
            preferredSpecialization: prefSpec,
            updatedAt: new Date(),
          })
          .where(eq(clientProfiles.userId, user.id));
      } else {
        await tx.insert(clientProfiles).values({
          userId: user.id,
          dizzinessHistory: parq.dizzinessOrLossOfConsciousness,
          medicalNotes,
          preferredSpecialization: prefSpec,
        });
      }

      const [uRow] = await tx
        .select({ phone: users.phone, dateOfBirth: users.dateOfBirth })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      // Record in eventParqSubmissions for centralized medical tracking
      await tx.insert(eventParqSubmissions).values({
        fullName: user.fullName || "Client User",
        email: user.email,
        phone: uRow?.phone || "N/A",
        country: "Nigeria",
        address: "N/A",
        dateOfBirth: uRow?.dateOfBirth || "1980-01-01",
        heartCondition: parq.heartCondition,
        chestPain: parq.chestPain,
        dizzinessOrLossOfConsciousness: parq.dizzinessOrLossOfConsciousness,
        boneOrJointProblems: parq.boneOrJointProblems,
        bpOrHeartMedication: parq.bpOrHeartMedication,
        informationCorrect: parq.informationCorrect,
        otherReasonsNotToExercise: parq.otherReasonsNotToExercise,
        otherReasonsDetails: parq.otherReasonsDetails || null,
        healthChangeAcknowledged: parq.healthChangeAcknowledged,
        additionalQuestions: parq.additionalQuestions || null,
        goals: `${svc.name} (${sessionCount} sessions)`,
        plannedStartDate: body.startDate,
        seriousnessScore: 10,
      });
    }

    // Pre-create N placeholder training sessions, all at start_date 09:00 local.
    const initialAt = new Date(`${body.startDate}T09:00:00.000Z`);
    const placeholders = Array.from({ length: sessionCount }, (_, i) => {
      const dt = new Date(initialAt);
      dt.setUTCDate(dt.getUTCDate() + i * 2); // every other day; admin will reschedule
      return {
        bookingId: booking.id,
        clientId: user.id,
        scheduledAt: dt,
        status:
          body.sessionType === "physical_assessment" && i === 0
            ? ("assessment" as const)
            : ("upcoming" as const),
      };
    });
    await tx.insert(trainingSessions).values(placeholders);

    return { booking, serviceName: svc.name, sessionCount, totalAmountNaira };
  });

  return {
    data: {
      booking: result.booking,
    },
    status: 201,
  };
});

