import { z } from "zod";
import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { fitnessPlans, users, fitnessPlanStatusEnum } from "@/db/schema";
import { withAuth, withIdempotency } from "@/lib/api/handler";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(200),
  focus: z.enum(["strength", "balance", "mobility", "core", "cardio"]),
});

// =============================================================================
// GET /api/fitness-plans?clientId=... — list plans
//   - clients see only their own plans
//   - trainers see plans they authored or for assigned clients
//   - admins see all
// =============================================================================

const listSchema = z.object({
  clientId: z.string().uuid().optional(),
  status: z.enum(fitnessPlanStatusEnum.enumValues).optional(),
});

export const GET = withAuth(async ({ req, user }) => {
  const q = parseSearchParams(req, listSchema);

  const filters: SQL[] = [];
  if (user.role === "client") {
    filters.push(eq(fitnessPlans.clientId, user.id));
  } else if (user.role === "trainer") {
    if (q.clientId) filters.push(eq(fitnessPlans.clientId, q.clientId));
    filters.push(eq(fitnessPlans.trainerId, user.id));
  } else if (q.clientId) {
    filters.push(eq(fitnessPlans.clientId, q.clientId));
  }
  if (q.status) filters.push(eq(fitnessPlans.status, q.status));

  const rows = await db
    .select({
      id: fitnessPlans.id,
      clientId: fitnessPlans.clientId,
      clientName: users.fullName,
      trainerId: fitnessPlans.trainerId,
      notes: fitnessPlans.notes,
      exercises: fitnessPlans.exercises,
      status: fitnessPlans.status,
      createdAt: fitnessPlans.createdAt,
      updatedAt: fitnessPlans.updatedAt,
    })
    .from(fitnessPlans)
    .innerJoin(users, eq(users.id, fitnessPlans.clientId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(fitnessPlans.createdAt));

  return { data: { plans: rows } };
});

// =============================================================================
// POST /api/fitness-plans — trainer creates a plan for a client (idempotent)
// =============================================================================

const createSchema = z.object({
  clientId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
  exercises: z.array(exerciseSchema).min(1).max(50),
});

export const POST = withIdempotency(
  async ({ req, user }) => {
    const body = await parseJsonBody(req, createSchema);

    const [client] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, body.clientId))
      .limit(1);
    if (!client || client.role !== "client") {
      throw new ApiError("NOT_FOUND", "Client not found");
    }

    const [plan] = await db
      .insert(fitnessPlans)
      .values({
        clientId: body.clientId,
        trainerId: user.id,
        notes: body.notes,
        exercises: body.exercises,
        status: "active",
      })
      .returning();

    return { data: { plan }, status: 201 };
  },
  { roles: ["trainer", "admin"] }
);
