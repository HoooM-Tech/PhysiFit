import { z } from "zod";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db/client";
import { users, clientProfiles } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const trainerUsers = alias(users, "trainer_users");

const updateAssignmentSchema = z.object({
  clientId: z.string().uuid("Invalid client user ID"),
  assignedTrainerId: z.string().uuid("Invalid trainer user ID").nullable(),
});

// GET: Fetch all clients, their profiles, and their assigned trainer
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
          id: clientProfiles.id,
          weightKg: clientProfiles.weightKg,
          heightCm: clientProfiles.heightCm,
          dizzinessHistory: clientProfiles.dizzinessHistory,
          medicalNotes: clientProfiles.medicalNotes,
          assignedTrainerId: clientProfiles.assignedTrainerId,
        },
        assignedTrainerName: trainerUsers.fullName,
      })
      .from(users)
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .leftJoin(trainerUsers, eq(trainerUsers.id, clientProfiles.assignedTrainerId))
      .where(eq(users.role, "client"))
      .orderBy(users.fullName);

    return { data: { clients: rows } };
  },
  { roles: ["admin"] }
);

// PATCH: Assign or reassign a trainer to a client
export const PATCH = withAuth(
  async ({ req }) => {
    const body = await parseJsonBody(req, updateAssignmentSchema);

    // Verify if trainer exists and has the trainer role (if assignedTrainerId is not null)
    if (body.assignedTrainerId) {
      const [trainer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, body.assignedTrainerId))
        .limit(1);

      if (!trainer) {
        throw new ApiError("NOT_FOUND", "Selected trainer not found");
      }
    }

    // Check if the client profile exists
    const [existingProfile] = await db
      .select({ id: clientProfiles.id })
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, body.clientId))
      .limit(1);

    let updated;
    if (existingProfile) {
      [updated] = await db
        .update(clientProfiles)
        .set({
          assignedTrainerId: body.assignedTrainerId,
          updatedAt: new Date(),
        })
        .where(eq(clientProfiles.userId, body.clientId))
        .returning({
          id: clientProfiles.id,
          assignedTrainerId: clientProfiles.assignedTrainerId,
        });
    } else {
      [updated] = await db
        .insert(clientProfiles)
        .values({
          userId: body.clientId,
          assignedTrainerId: body.assignedTrainerId,
          dizzinessHistory: false,
        })
        .returning({
          id: clientProfiles.id,
          assignedTrainerId: clientProfiles.assignedTrainerId,
        });
    }

    if (!updated) {
      throw new ApiError("INTERNAL_ERROR", "Failed to update or create client profile");
    }

    return { data: { profile: updated } };
  },
  { roles: ["admin"] }
);
