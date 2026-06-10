import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const priceUpdateSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  priceNairaPerSession: z.number().int().positive("Price must be a positive integer"),
});

// PATCH: Update service price per session
export const PATCH = withAuth(
  async ({ req }) => {
    const body = await parseJsonBody(req, priceUpdateSchema);

    // Update the service price in the database
    const [updated] = await db
      .update(services)
      .set({
        priceNairaPerSession: body.priceNairaPerSession,
        updatedAt: new Date(),
      })
      .where(eq(services.id, body.serviceId))
      .returning({
        id: services.id,
        name: services.name,
        slug: services.slug,
        priceNairaPerSession: services.priceNairaPerSession,
      });

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Service not found");
    }

    return { data: { service: updated } };
  },
  { roles: ["admin", "super_admin"] }
);
