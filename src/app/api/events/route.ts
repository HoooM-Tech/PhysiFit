import { asc, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { events, eventRegistrations } from "@/db/schema";
import { withRoute } from "@/lib/api/handler";

// Public: list upcoming events (no venue address — that's revealed post-register).
export const GET = withRoute(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      eventDate: events.eventDate,
      startTime: events.startTime,
      endTime: events.endTime,
      priceNaira: events.priceNaira,
      capacity: events.capacity,
      // Aggregate registered count via subquery
      registeredCount: sql<number>`(
        select count(*)::int from ${eventRegistrations}
        where ${eventRegistrations.eventId} = ${events.id}
      )`,
    })
    .from(events)
    .where(gte(events.eventDate, today))
    .orderBy(asc(events.eventDate));

  return { data: { events: rows } };
});
