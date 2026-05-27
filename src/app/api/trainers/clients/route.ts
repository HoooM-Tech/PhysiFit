import { and, eq, or, sql, desc, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { users, clientProfiles, bookings, services, trainingSessions } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";

export const dynamic = "force-dynamic";

export const GET = withAuth(async ({ user }) => {
  // Query all unique clients assigned to this trainer or having bookings with this trainer
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      weightKg: clientProfiles.weightKg,
      heightCm: clientProfiles.heightCm,
      medicalNotes: clientProfiles.medicalNotes,
    })
    .from(users)
    .innerJoin(clientProfiles, eq(clientProfiles.userId, users.id))
    .leftJoin(bookings, eq(bookings.clientId, users.id))
    .where(
      and(
        eq(users.role, "client"),
        ne(users.passwordHash, "placeholder_guest_account_hash"),
        or(
          eq(clientProfiles.assignedTrainerId, user.id),
          eq(bookings.trainerId, user.id)
        )
      )
    )
    .groupBy(users.id, clientProfiles.id);

  // For each client, query their bookings or sessions with this trainer to calculate progress and next session
  const clientsWithProgress = await Promise.all(
    rows.map(async (client) => {
      // Get latest booking with this trainer
      const [booking] = await db
        .select({
          id: bookings.id,
          sessionCount: bookings.sessionCount,
          serviceName: services.name,
        })
        .from(bookings)
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .where(
          and(
            eq(bookings.clientId, client.id),
            eq(bookings.trainerId, user.id)
          )
        )
        .orderBy(desc(bookings.createdAt))
        .limit(1);

      let completedSessions = 0;
      let totalSessions = booking?.sessionCount ?? 8;
      let serviceName = booking?.serviceName ?? "Senior Fitness";

      if (booking) {
        // Count completed sessions for this booking
        const [completed] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(trainingSessions)
          .where(
            and(
              eq(trainingSessions.bookingId, booking.id),
              eq(trainingSessions.status, "completed")
            )
          );
        completedSessions = completed?.count ?? 0;
      }

      // Find next upcoming session
      const [nextSession] = await db
        .select({ scheduledAt: trainingSessions.scheduledAt })
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.clientId, client.id),
            eq(trainingSessions.trainerId, user.id),
            eq(trainingSessions.status, "upcoming")
          )
        )
        .orderBy(trainingSessions.scheduledAt)
        .limit(1);
      const nextSessionDate = nextSession?.scheduledAt ?? null;

      return {
        id: client.id,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        weightKg: client.weightKg,
        heightCm: client.heightCm,
        medicalNotes: client.medicalNotes,
        serviceName,
        completedSessions,
        totalSessions,
        nextSessionDate,
      };
    })
  );

  return { data: { clients: clientsWithProgress } };
}, { roles: ["trainer"] });
