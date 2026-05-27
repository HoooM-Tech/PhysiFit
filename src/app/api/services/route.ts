import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";

// Public endpoint — pricing is shown pre-login.
export const GET = withRoute(async () => {
  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      description: services.description,
      priceNairaPerSession: services.priceNairaPerSession,
    })
    .from(services)
    .where(eq(services.active, true))
    .orderBy(services.name);
  return { data: { services: rows } };
});
