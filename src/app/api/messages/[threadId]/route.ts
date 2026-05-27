import { z } from "zod";
import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { messages } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { uuidSchema } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export const GET = withAuth(async ({ user, params }) => {
  const threadId = uuidSchema.parse(params.threadId);

  // Authorization: user must be a participant in the thread.
  const [touch] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.threadId, threadId),
        or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id))
      )
    )
    .limit(1);
  if (!touch) throw new ApiError("NOT_FOUND", "Thread not found");

  // Mark all unread messages where this user is recipient as read.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.threadId, threadId),
        eq(messages.recipientId, user.id),
        isNull(messages.readAt)
      )
    );

  const rows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      body: messages.body,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));

  return { data: { threadId, messages: rows } };
});
