import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "@/db/client";
import { messages, users } from "@/db/schema";
import { withAuth, withIdempotency } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

// =============================================================================
// GET /api/messages — list threads (latest message per thread for current user)
// =============================================================================

export const GET = withAuth(async ({ user }) => {
  // One row per thread = latest message where user is sender or recipient.
  const rows = await db.execute<{
    thread_id: string;
    other_user_id: string;
    other_user_name: string;
    body: string;
    created_at: Date;
    unread_count: number;
  }>(sql`
    with my_messages as (
      select * from ${messages}
      where ${messages.senderId} = ${user.id} or ${messages.recipientId} = ${user.id}
    ),
    latest as (
      select distinct on (thread_id) *
      from my_messages
      order by thread_id, created_at desc
    )
    select
      l.thread_id,
      case when l.sender_id = ${user.id} then l.recipient_id else l.sender_id end as other_user_id,
      u.full_name as other_user_name,
      l.body,
      l.created_at,
      (
        select count(*) from ${messages} m
        where m.thread_id = l.thread_id
          and m.recipient_id = ${user.id}
          and m.read_at is null
      )::int as unread_count
    from latest l
    join ${users} u on u.id = case when l.sender_id = ${user.id} then l.recipient_id else l.sender_id end
    where u.password_hash != 'placeholder_guest_account_hash'
    order by l.created_at desc
  `);

  return { data: { threads: rows.rows } };
});

// =============================================================================
// POST /api/messages — send a message (idempotent)
// =============================================================================

const sendSchema = z.object({
  recipientId: z.string().uuid(),
  body: z.string().min(1).max(4000),
  threadId: z.string().uuid().optional(),
});

function deterministicThreadId(a: string, b: string): string {
  // Sort to make thread id stable regardless of who initiates the conversation.
  const [x, y] = [a, b].sort();
  const hex = createHash("sha1").update(`${x}:${y}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export const POST = withIdempotency(async ({ req, user }) => {
  const body = await parseJsonBody(req, sendSchema);

  if (body.recipientId === user.id) {
    throw new ApiError("VALIDATION_ERROR", "Cannot send a message to yourself");
  }

  // Verify recipient exists and is active.
  const [recipient] = await db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, body.recipientId))
    .limit(1);
  if (!recipient || recipient.status !== "active") {
    throw new ApiError("NOT_FOUND", "Recipient not found");
  }

  const threadId = body.threadId ?? deterministicThreadId(user.id, body.recipientId);

  const [msg] = await db
    .insert(messages)
    .values({
      threadId,
      senderId: user.id,
      recipientId: body.recipientId,
      body: body.body,
    })
    .returning();

  return { data: { message: msg }, status: 201 };
});
