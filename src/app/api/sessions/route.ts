import { z } from "zod";
import { and, desc, eq, gte, lte, or, SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  trainingSessions,
  trainingSessionStatusEnum,
  users,
  bookings,
  services,
} from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseSearchParams } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  status: z.enum(trainingSessionStatusEnum.enumValues).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const GET = withAuth(async ({ req, user }) => {
  const q = parseSearchParams(req, querySchema);

  const filters: SQL[] = [];
  // Clients see their sessions; trainers see sessions assigned to them; admins see all.
  if (user.role === "client") {
    filters.push(eq(trainingSessions.clientId, user.id));
  } else if (user.role === "trainer") {
    filters.push(eq(trainingSessions.trainerId, user.id));
  }
  if (q.status) filters.push(eq(trainingSessions.status, q.status));
  if (q.from) filters.push(gte(trainingSessions.scheduledAt, new Date(q.from)));
  if (q.to) filters.push(lte(trainingSessions.scheduledAt, new Date(q.to)));

  const rows = await db
    .select({
      id: trainingSessions.id,
      bookingId: trainingSessions.bookingId,
      clientId: trainingSessions.clientId,
      clientName: users.fullName,
      trainerId: trainingSessions.trainerId,
      scheduledAt: trainingSessions.scheduledAt,
      status: trainingSessions.status,
      trainerCheckedInAt: trainingSessions.trainerCheckedInAt,
      clientAttendedAt: trainingSessions.clientAttendedAt,
      serviceName: services.name,
    })
    .from(trainingSessions)
    .innerJoin(users, eq(users.id, trainingSessions.clientId))
    .innerJoin(bookings, eq(bookings.id, trainingSessions.bookingId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(trainingSessions.scheduledAt))
    .limit(q.limit ?? 50);

  return { data: { sessions: rows } };
});
