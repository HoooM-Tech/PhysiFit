import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, clientProfiles, trainerProfiles } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";

export const dynamic = "force-dynamic";
import { ApiError } from "@/lib/api/errors";

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
