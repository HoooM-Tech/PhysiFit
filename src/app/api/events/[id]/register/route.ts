import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { events, eventRegistrations } from "@/db/schema";
import { withIdempotency } from "@/lib/api/handler";
import { uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const POST = withIdempotency(async ({ user, params }) => {
  const eventId = uuidSchema.parse(params.id);

  const result = await db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new ApiError("NOT_FOUND", "Event not found");

    // Capacity check inside the transaction to prevent overbooking races.
    const [{ value: registered }] = await tx
      .select({ value: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    if (Number(registered) >= event.capacity) {
      throw new ApiError("CONFLICT", "This event is at capacity");
    }

    // The unique (event_id, user_id) constraint catches double-register at the DB level.
    let registration;
    try {
      const [r] = await tx
        .insert(eventRegistrations)
        .values({ eventId, userId: user.id })
        .returning();
      registration = r;
    } catch (err: any) {
      if (String(err?.code) === "23505") {
        throw new ApiError("CONFLICT", "You are already registered for this event");
      }
      throw err;
    }

    return {
      registration,
      // Venue revealed only on successful registration, per requirement.
      venueAddress: event.venueAddress,
    };
  });

  return { data: result, status: 201 };
});
