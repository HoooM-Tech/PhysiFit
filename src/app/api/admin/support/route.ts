import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { supportTickets } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  ticketId: z.string().uuid("Invalid support ticket ID"),
  status: z.enum(["open", "resolved"]),
});

// GET: Fetch all support tickets
export const GET = withAuth(
  async () => {
    const tickets = await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));

    return { data: { tickets } };
  },
  { roles: ["admin", "super_admin"] }
);

// PATCH: Resolve a support ticket
export const PATCH = withAuth(
  async ({ req }) => {
    const body = await parseJsonBody(req, updateStatusSchema);

    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ status: body.status })
      .where(eq(supportTickets.id, body.ticketId))
      .returning();

    return { data: { ticket: updatedTicket } };
  },
  { roles: ["admin", "super_admin"] }
);

// DELETE: Delete a support ticket
export const DELETE = withAuth(
  async ({ req }) => {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("ticketId");
    if (!ticketId) {
      throw new Error("Support ticket ID is required");
    }

    await db
      .delete(supportTickets)
      .where(eq(supportTickets.id, ticketId));

    return { data: { success: true } };
  },
  { roles: ["super_admin"] }
);

