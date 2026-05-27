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

  // Fetch all messages in this thread
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

  // If there are messages, verify that the logged-in user is a participant
  if (rows.length > 0) {
    const isParticipant = rows.some(
      (r) => r.senderId === user.id || r.recipientId === user.id
    );
    if (!isParticipant) {
      throw new ApiError("FORBIDDEN", "You are not a participant in this thread");
    }

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
  }

  return { data: { threadId, messages: rows } };
});
