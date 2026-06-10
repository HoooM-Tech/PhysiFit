import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, clientProfiles, trainerProfiles, authSessions } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { z } from "zod";
import { parseJsonBody } from "@/lib/api/validate";

export const dynamic = "force-dynamic";
import { ApiError } from "@/lib/api/errors";

const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  phone: z.string().nullable().optional(),
  weightKg: z.number().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
});

export const GET = withAuth(async ({ user }) => {
  const [base] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      role: users.role,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!base) throw new ApiError("NOT_FOUND", "User not found");

  let profile: object | null = null;
  if (base.role === "client") {
    const [cp] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, base.id))
      .limit(1);
    profile = cp ?? null;
  } else if (base.role === "trainer") {
    const [tp] = await db
      .select()
      .from(trainerProfiles)
      .where(eq(trainerProfiles.userId, base.id))
      .limit(1);
    profile = tp ?? null;
  }

  return { data: { user: base, profile } };
});

export const PATCH = withAuth(async ({ req, user }) => {
  const body = await parseJsonBody(req, updateProfileSchema);

  await db.transaction(async (tx) => {
    if (body.fullName !== undefined || body.phone !== undefined) {
      await tx
        .update(users)
        .set({
          ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    if (user.role === "client") {
      const [cp] = await tx
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, user.id))
        .limit(1);

      if (cp) {
        await tx
          .update(clientProfiles)
          .set({
            ...(body.weightKg !== undefined ? { weightKg: body.weightKg } : {}),
            ...(body.heightCm !== undefined ? { heightCm: body.heightCm } : {}),
            ...(body.medicalNotes !== undefined ? { medicalNotes: body.medicalNotes } : {}),
            updatedAt: new Date(),
          })
          .where(eq(clientProfiles.userId, user.id));
      } else {
        await tx
          .insert(clientProfiles)
          .values({
            userId: user.id,
            weightKg: body.weightKg ?? null,
            heightCm: body.heightCm ?? null,
            medicalNotes: body.medicalNotes ?? null,
            dizzinessHistory: false,
          });
      }
    }
  });

  return { data: { success: true } };
});

// Allow authenticated users to delete their own account
export const DELETE = withAuth(async ({ user }) => {
  // Soft-archive the user's account so it can be recovered if needed.
  const result = await db.transaction(async (tx) => {
    const [u] = await tx
      .update(users)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning({ id: users.id, status: users.status });

    // Remove any active sessions for immediate sign-out
    await tx.delete(authSessions).where(eq(authSessions.userId, user.id));

    return u;
  });

  if (!result) {
    throw new ApiError('INTERNAL_ERROR', 'Failed to archive account');
  }

  return { data: { success: true, archived: true } };
});
