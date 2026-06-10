import { z } from "zod";
import { and, eq, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db/client";
import { users, clientProfiles, bookings, trainingSessions, authSessions } from "@/db/schema";
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
          preferredSpecialization: clientProfiles.preferredSpecialization,
          medicalNotes: clientProfiles.medicalNotes,
          assignedTrainerId: clientProfiles.assignedTrainerId,
        },
        assignedTrainerName: trainerUsers.fullName,
      })
      .from(users)
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .leftJoin(trainerUsers, eq(trainerUsers.id, clientProfiles.assignedTrainerId))
      .where(
        and(
          eq(users.role, "client"),
          ne(users.passwordHash, "placeholder_guest_account_hash")
        )
      )
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

    // Cascade trainer assignment to client profile, bookings, and training sessions in a transaction
    const updated = await db.transaction(async (tx) => {
      // Check if the client profile exists
      const [existingProfile] = await tx
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, body.clientId))
        .limit(1);

      let up;
      if (existingProfile) {
        [up] = await tx
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
        [up] = await tx
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

      // Proactively update all bookings for this client
      await tx
        .update(bookings)
        .set({ trainerId: body.assignedTrainerId })
        .where(eq(bookings.clientId, body.clientId));

      // Update all upcoming or assessment training sessions for this client to assign/reassign the trainer!
      await tx
        .update(trainingSessions)
        .set({ trainerId: body.assignedTrainerId })
        .where(
          and(
            eq(trainingSessions.clientId, body.clientId),
            or(
              eq(trainingSessions.status, "upcoming"),
              eq(trainingSessions.status, "assessment")
            )
          )
        );

      return up;
    });

    if (!updated) {
      throw new ApiError("INTERNAL_ERROR", "Failed to update or create client profile");
    }

    return { data: { profile: updated } };
  },
  { roles: ["admin"] }
);

// DELETE: Archive a client (admin) or fully delete (super-admin with force)
const deleteSchema = z.object({ clientId: z.string().uuid(), force: z.boolean().optional() });
export const DELETE = withAuth<{ success: boolean; deleted?: boolean; archived?: boolean }>(
  async (ctx) => {
    const { req, user } = ctx;
    const body = await parseJsonBody(req, deleteSchema);
    const clientId = body.clientId;
    const force = !!body.force;

    // Ensure user exists and is a client
    const [existing] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, clientId))
      .limit(1);
    if (!existing) throw new ApiError("NOT_FOUND", "Client not found");
    if (existing.role !== 'client') throw new ApiError("VALIDATION_ERROR", "Target is not a client");

    // Super-admins may request a full hard-delete by setting `force: true`.
    if (user.role === 'super_admin' && force) {
      await db.transaction(async (tx) => {
        await tx.delete(users).where(eq(users.id, clientId));
      });
      return { data: { success: true, deleted: true } };
    }

    // Default for admins and non-forced requests: soft-archive the account
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(users.id, clientId));

      // Remove any active sessions so the archived account is immediately signed out
      await tx.delete(authSessions).where(eq(authSessions.userId, clientId));
    });

    return { data: { success: true, archived: true } };
  },
  { roles: ["admin", "super_admin"] }
);
