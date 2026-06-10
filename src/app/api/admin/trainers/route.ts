import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, trainerProfiles, fitnessPlans } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { notifyTrainerApproved } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

const approvalSchema = z.object({
  trainerId: z.string().uuid("Invalid trainer user ID"),
});

// GET: Fetch all trainers and their profile details
export const GET = withAuth(
  async () => {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        status: users.status,
        createdAt: users.createdAt,
        profile: {
          id: trainerProfiles.id,
          specialization: trainerProfiles.specialization,
          bio: trainerProfiles.bio,
          isOnline: trainerProfiles.isOnline,
          approvedAt: trainerProfiles.approvedAt,
          yearsOfExperience: trainerProfiles.yearsOfExperience,
          cvUrl: trainerProfiles.cvUrl,
          certifications: trainerProfiles.certifications,
          education: trainerProfiles.education,
          onboardingAnswers: trainerProfiles.onboardingAnswers,
        },
      })
      .from(users)
      .leftJoin(trainerProfiles, eq(trainerProfiles.userId, users.id))
      .where(eq(users.role, "trainer"))
      .orderBy(users.fullName);

    return { data: { trainers: rows } };
  },
  { roles: ["admin"] }
);

// PATCH: Approve a trainer application
export const PATCH = withAuth(
  async ({ req }) => {
    const body = await parseJsonBody(req, approvalSchema);

    const [trainer] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, body.trainerId))
      .limit(1);

    if (!trainer) {
      throw new ApiError("NOT_FOUND", "Trainer user not found");
    }

    // Update approvedAt in trainer profile
    const [updated] = await db
      .update(trainerProfiles)
      .set({
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trainerProfiles.userId, body.trainerId))
      .returning({
        id: trainerProfiles.id,
        approvedAt: trainerProfiles.approvedAt,
      });

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Trainer profile not found");
    }

    notifyTrainerApproved({
      email: trainer.email,
      fullName: trainer.fullName,
    });

    return { data: { profile: updated } };
  },
  { roles: ["admin"] }
);
