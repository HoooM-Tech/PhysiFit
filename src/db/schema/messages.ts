import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    threadId: uuid("thread_id").notNull(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    threadCreatedIdx: index("messages_thread_created_idx").on(t.threadId, t.createdAt),
    unreadIdx: index("messages_unread_idx")
      .on(t.recipientId)
      .where(sql`${t.readAt} is null`),
  })
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
