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
      })
      .returning({
        id: users.id,
        role: users.role,
        email: users.email,
        fullName: users.fullName,
      });

    if (!u) throw new ApiError("INTERNAL_ERROR", "Failed to create account");

    if (body.role === "client") {
      await tx.insert(clientProfiles).values({
        userId: u.id,
        weightKg: body.weightKg,
        heightCm: body.heightCm,
        dizzinessHistory: body.dizzinessHistory ?? false,
        medicalNotes: body.medicalNotes,
      });
    } else if (body.role === "trainer") {
      await tx.insert(trainerProfiles).values({
        userId: u.id,
        specialization: body.specialization!,
      });
    }
    return u;
  });

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
