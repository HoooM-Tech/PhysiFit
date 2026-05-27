import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  users,
  trainerProfiles,
  trainerSpecializationEnum,
} from "@/db/schema";
import { withRoute } from "@/lib/api/handler";
import { parseSearchParams } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  specialization: z.enum(trainerSpecializationEnum.enumValues).optional(),
  online: z.enum(["true", "false"]).optional(),
});

export const GET = withRoute(async ({ req }) => {
  const q = parseSearchParams(req, querySchema);

  const conditions = [
    eq(users.role, "trainer"),
    eq(users.status, "active"),
    sql`${trainerProfiles.approvedAt} is not null`,
  ];
  if (q.specialization) {
    conditions.push(eq(trainerProfiles.specialization, q.specialization));
  }
  if (q.online === "true") {
    conditions.push(eq(trainerProfiles.isOnline, true));
  } else if (q.online === "false") {
    conditions.push(eq(trainerProfiles.isOnline, false));
  }

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      specialization: trainerProfiles.specialization,
      bio: trainerProfiles.bio,
      isOnline: trainerProfiles.isOnline,
    })
    .from(users)
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(users.fullName);

  return { data: { trainers: rows } };
});
