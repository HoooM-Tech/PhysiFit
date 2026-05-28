import { NextResponse, NextRequest } from "next/server";
import { and, eq, or, sql, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { users, clientProfiles, bookings, services, trainingSessions } from "@/db/schema";
import { notifyTrainerDailyDigest } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Authorization check (e.g. standard Vercel Cron authorization header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch all active trainers
    const trainers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "trainer"),
          eq(users.status, "active")
        )
      );

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let sentCount = 0;

    for (const trainer of trainers) {
      // 2. Fetch today's upcoming sessions for this trainer
      const todaySessionsRows = await db
        .select({
          clientName: users.fullName,
          scheduledAt: trainingSessions.scheduledAt,
          serviceName: services.name,
        })
        .from(trainingSessions)
        .innerJoin(users, eq(users.id, trainingSessions.clientId))
        .innerJoin(bookings, eq(bookings.id, trainingSessions.bookingId))
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .where(
          and(
            eq(trainingSessions.trainerId, trainer.id),
            eq(trainingSessions.status, "upcoming"),
            sql`${trainingSessions.scheduledAt} >= ${startOfToday}`,
            sql`${trainingSessions.scheduledAt} <= ${endOfToday}`
          )
        )
        .orderBy(trainingSessions.scheduledAt);

      const todaySessions = todaySessionsRows.map((s) => ({
        clientName: s.clientName,
        time: s.scheduledAt.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        service: s.serviceName,
      }));

      // 3. Fetch completed sessions in the last 7 days
      const [completedCountRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.trainerId, trainer.id),
            eq(trainingSessions.status, "completed"),
            sql`${trainingSessions.scheduledAt} >= ${sevenDaysAgo}`
          )
        );
      const completedThisWeek = completedCountRow?.count ?? 0;

      // 4. Fetch active clients count
      const [activeClientsCountRow] = await db
        .select({ count: sql<number>`count(distinct ${users.id})::int` })
        .from(users)
        .innerJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .leftJoin(bookings, eq(bookings.clientId, users.id))
        .where(
          and(
            eq(users.role, "client"),
            ne(users.passwordHash, "placeholder_guest_account_hash"),
            or(
              eq(clientProfiles.assignedTrainerId, trainer.id),
              eq(bookings.trainerId, trainer.id)
            )
          )
        );
      const activeClients = activeClientsCountRow?.count ?? 0;

      // Send daily digest email
      notifyTrainerDailyDigest({
        trainerEmail: trainer.email,
        trainerName: trainer.fullName,
        todaySessions,
        completedThisWeek,
        activeClients,
      });

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully triggered trainer digests for ${sentCount} active trainers.`,
    });
  } catch (err: any) {
    console.error("[trainer-digest-cron-error]", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
