import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const recoverSchema = z.object({ clientId: z.string().uuid() });

export const POST = withAuth(
  async ({ req }) => {
    const body = await parseJsonBody(req, recoverSchema);
    const clientId = body.clientId;

    const [existing] = await db
      .select({ id: users.id, role: users.role, status: users.status })
      .from(users)
      .where(eq(users.id, clientId))
      .limit(1);

    if (!existing) throw new ApiError("NOT_FOUND", "Client not found");
    if (existing.role !== 'client') throw new ApiError("VALIDATION_ERROR", "Target is not a client");

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(users.id, clientId));
    });

    return { data: { success: true, recovered: true } };
  },
  { roles: ["admin", "super_admin"] }
);
