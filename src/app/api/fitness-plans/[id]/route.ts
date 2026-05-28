import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { fitnessPlans, users } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody, uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { notifyFitnessPlanUpdated } from "@/lib/email/notify";

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(200),
  focus: z.enum(["strength", "balance", "mobility", "core", "cardio"]),
});

const updateSchema = z.object({
  notes: z.string().max(2000).optional(),
  exercises: z.array(exerciseSchema).min(1).max(50).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const PUT = withAuth(async ({ req, user, params }) => {
  const planId = uuidSchema.parse(params.id);
  const body = await parseJsonBody(req, updateSchema);

  // At least one field must be provided
  if (!body.notes && body.notes !== "" && !body.exercises && !body.status) {
    throw new ApiError("VALIDATION_ERROR", "At least one field (notes, exercises, status) must be provided");
  }

  const { updated, client } = await db.transaction(async (tx) => {
    const [plan] = await tx
      .select()
      .from(fitnessPlans)
      .where(eq(fitnessPlans.id, planId))
      .limit(1);

    if (!plan) throw new ApiError("NOT_FOUND", "Fitness plan not found");

    // Only the trainer who authored the plan (or admin) can edit
    const isAuthor = plan.trainerId === user.id;
    const isAdmin = user.role === "admin";
    if (!isAuthor && !isAdmin) {
      throw new ApiError("FORBIDDEN", "You can only edit plans you authored");
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.notes !== undefined) updates.notes = body.notes || null;
    if (body.exercises) updates.exercises = body.exercises;
    if (body.status) updates.status = body.status;

    const [updatedPlan] = await tx
      .update(fitnessPlans)
      .set(updates)
      .where(eq(fitnessPlans.id, planId))
      .returning();

    const [clientUser] = await tx
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, plan.clientId))
      .limit(1);

    return { updated: updatedPlan, client: clientUser };
  });

  if (client) {
    notifyFitnessPlanUpdated({
      clientEmail: client.email,
      clientName: client.fullName,
      trainerName: user.fullName,
      exerciseCount: updated.exercises.length,
    });
  }

  return { data: { plan: updated } };
}, { roles: ["trainer", "admin"] });
