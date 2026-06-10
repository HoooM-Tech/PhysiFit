import { z } from "zod";
import { db } from "@/db/client";
import { supportTickets } from "@/db/schema";
import { withAuth } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/validate";
import { notifySupportTicket } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

const supportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export const POST = withAuth<{ success: boolean }>(
  async ({ req, user }) => {
    const body = await parseJsonBody(req, supportSchema);

    // Insert the support ticket in the DB
    await db.insert(supportTickets).values({
      userId: user?.id || null,
      name: body.name,
      email: body.email,
      message: body.message,
      status: "open",
    });

    // Send the support message details to the admin emails
    notifySupportTicket({
      name: body.name,
      email: body.email,
      message: body.message,
    });

    return { data: { success: true } };
  }
);

