import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { withAuth } from "@/lib/api/handler";

export const dynamic = "force-dynamic";

// Recent activity feed for admin dashboard — last 50 events across signups,
// bookings, payments, messages, and sessions, ordered by time.
export const GET = withAuth(
  async () => {
    const result = await db.execute<{
      kind: string;
      ref_id: string;
      summary: string;
      occurred_at: Date;
    }>(sql`
      (
        select 'signup'::text as kind, id::text as ref_id,
               'New ' || role || ' signup: ' || full_name as summary,
               created_at as occurred_at
        from users
        order by created_at desc
        limit 20
      )
      union all
      (
        select 'booking'::text, id::text,
               'New booking: ' || session_count || ' sessions for ' || total_amount_naira || ' NGN',
               created_at
        from bookings
        order by created_at desc
        limit 20
      )
      union all
      (
        select 'payment'::text, id::text,
               'Payment ' || status || ': ' || amount_naira || ' NGN',
               created_at
        from payments
        order by created_at desc
        limit 20
      )
      order by occurred_at desc
      limit 50
    `);

    return { data: { activity: result.rows } };
  },
  { roles: ["admin", "super_admin"] }
);
