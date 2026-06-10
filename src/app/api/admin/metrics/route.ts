import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  users,
  bookings,
  trainingSessions,
  payments,
} from "@/db/schema";
import { withAuth } from "@/lib/api/handler";

export const dynamic = "force-dynamic";

// Admin-only dashboard metrics. All counts computed server-side from real data.
export const GET = withAuth(
  async () => {
    // One round-trip via UNION ALL to keep latency low.
    const result = await db.execute<{
      active_users: number;
      new_signups_week: number;
      monthly_revenue_naira: number;
      sessions_total: number;
      sessions_upcoming: number;
      sessions_completed_30d: number;
      reschedules_week: number;
    }>(sql`
      select
        (select count(*) from ${users} where status = 'active')::int as active_users,
        (select count(*) from ${users} where created_at > now() - interval '7 days')::int as new_signups_week,
        (
          select coalesce(sum(amount_naira), 0)::int from ${payments}
          where status = 'confirmed' and created_at > now() - interval '30 days'
        ) as monthly_revenue_naira,
        (select count(*) from ${trainingSessions})::int as sessions_total,
        (select count(*) from ${trainingSessions} where status = 'upcoming' and scheduled_at > now())::int as sessions_upcoming,
        (
          select count(*) from ${trainingSessions}
          where status = 'completed' and updated_at > now() - interval '30 days'
        )::int as sessions_completed_30d,
        (
          select count(*) from session_reschedules
          where created_at > now() - interval '7 days'
        )::int as reschedules_week
    `);

    return { data: { metrics: result.rows[0] } };
  },
  { roles: ["admin", "super_admin"] }
);
