import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, trainerProfiles } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";

export const GET = withRoute(async ({ params }) => {
  const id = uuidSchema.parse(params.id);

  const [row] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      specialization: trainerProfiles.specialization,
      bio: trainerProfiles.bio,
      isOnline: trainerProfiles.isOnline,
    })
    .from(users)
    .innerJoin(trainerProfiles, eq(trainerProfiles.userId, users.id))
    .where(and(eq(users.id, id), eq(users.role, "trainer"), eq(users.status, "active")))
    .limit(1);

  if (!row) throw new ApiError("NOT_FOUND", "Trainer not found");
  return { data: { trainer: row } };
});
