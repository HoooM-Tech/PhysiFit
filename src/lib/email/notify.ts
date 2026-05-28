import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/lib/env";
import { sendEmail, isEmailConfigured } from "./send";
import * as tpl from "./templates";

// =============================================================================
// Internal helpers
// =============================================================================

/** Resolve all admin email addresses from the database. */
async function getAdminEmails(): Promise<string[]> {
  // If a dedicated admin email is set, always include it.
  const manual = env.ADMIN_NOTIFICATION_EMAIL ? [env.ADMIN_NOTIFICATION_EMAIL] : [];

  try {
    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "admin"));
    const dbEmails = admins.map((a) => a.email);
    // Deduplicate
    return [...new Set([...manual, ...dbEmails])];
  } catch {
    return manual;
  }
}

/** Format a Date to a user-friendly string. */
function fmtDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " " + dt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Fire-and-forget email send. Catches all errors so the caller is
 * never blocked or crashed by a failed email delivery.
 */
function fireAndForget(fn: () => Promise<void>): void {
  if (!isEmailConfigured()) return;
  fn().catch((err) => console.error("[notify]", err));
}

// =============================================================================
// Public notification functions
// =============================================================================

/**
 * New user registered → email to all admins
 */
export function notifyNewRegistration(user: {
  fullName: string;
  email: string;
  role: string;
}): void {
  fireAndForget(async () => {
    const admins = await getAdminEmails();
    if (admins.length === 0) return;
    await sendEmail({
      to: admins,
      subject: `New ${user.role} registered: ${user.fullName}`,
      html: tpl.adminNewRegistrationEmail(user.fullName, user.email, user.role),
    });
  });
}

/**
 * Trainer approved → email to the trainer
 */
export function notifyTrainerApproved(trainer: {
  email: string;
  fullName: string;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: trainer.email,
      subject: "Your PhysiFit trainer account has been approved! 🎉",
      html: tpl.trainerApprovedEmail(trainer.fullName),
    });
  });
}

/**
 * Booking created → email to client + all admins
 */
export function notifySessionBooked(booking: {
  clientEmail: string;
  clientName: string;
  serviceName: string;
  sessionCount: number;
  startDate: string;
  totalAmountNaira: number;
}): void {
  fireAndForget(async () => {
    // Client email
    await sendEmail({
      to: booking.clientEmail,
      subject: `Your ${booking.serviceName} sessions have been booked!`,
      html: tpl.bookingConfirmationEmail(
        booking.clientName,
        booking.serviceName,
        booking.sessionCount,
        booking.startDate,
        booking.totalAmountNaira,
      ),
    });

    // Admin email
    const admins = await getAdminEmails();
    if (admins.length > 0) {
      await sendEmail({
        to: admins,
        subject: `New booking: ${booking.clientName} — ${booking.serviceName} x${booking.sessionCount}`,
        html: tpl.adminBookingEmail(
          booking.clientName,
          booking.clientEmail,
          booking.serviceName,
          booking.sessionCount,
          booking.totalAmountNaira,
        ),
      });
    }
  });
}

/**
 * Payment confirmed → email to client + all admins
 */
export function notifyPaymentConfirmed(payment: {
  userEmail: string;
  userName: string;
  amountNaira: number;
  providerRef: string;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: payment.userEmail,
      subject: `Payment confirmed — ₦${payment.amountNaira.toLocaleString()}`,
      html: tpl.paymentConfirmedEmail(payment.userName, payment.amountNaira, payment.providerRef),
    });

    const admins = await getAdminEmails();
    if (admins.length > 0) {
      await sendEmail({
        to: admins,
        subject: `Payment received: ₦${payment.amountNaira.toLocaleString()} from ${payment.userName}`,
        html: tpl.adminPaymentEmail(payment.userName, payment.amountNaira, payment.providerRef),
      });
    }
  });
}

/**
 * Session completed (trainer check-in) → email to client
 */
export function notifySessionCompleted(session: {
  clientEmail: string;
  clientName: string;
  trainerName: string;
  serviceName: string;
  scheduledAt: Date | string;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: session.clientEmail,
      subject: `Session completed with ${session.trainerName} ✓`,
      html: tpl.sessionCompletedEmail(
        session.clientName,
        session.trainerName,
        session.serviceName,
        fmtDate(session.scheduledAt),
      ),
    });
  });
}

/**
 * Session cancelled → email to client + all admins
 */
export function notifySessionCancelled(session: {
  clientEmail: string;
  clientName: string;
  trainerName: string;
  serviceName: string;
  scheduledAt: Date | string;
  reason?: string;
}): void {
  fireAndForget(async () => {
    const date = fmtDate(session.scheduledAt);

    await sendEmail({
      to: session.clientEmail,
      subject: `Session on ${date} has been cancelled`,
      html: tpl.sessionCancelledClientEmail(
        session.clientName,
        session.trainerName,
        session.serviceName,
        date,
        session.reason,
      ),
    });

    const admins = await getAdminEmails();
    if (admins.length > 0) {
      await sendEmail({
        to: admins,
        subject: `Session cancelled by ${session.trainerName}: ${session.clientName} on ${date}`,
        html: tpl.adminSessionCancelledEmail(
          session.trainerName,
          session.clientName,
          session.serviceName,
          date,
          session.reason,
        ),
      });
    }
  });
}

/**
 * Session rescheduled → email to the other party (if client rescheduled → trainer, vice versa)
 */
export function notifySessionRescheduled(data: {
  recipientEmail: string;
  recipientName: string;
  serviceName: string;
  oldDate: Date | string;
  newDate: Date | string;
  requestedByName: string;
  reason?: string;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: data.recipientEmail,
      subject: `Session rescheduled: ${fmtDate(data.oldDate)} → ${fmtDate(data.newDate)}`,
      html: tpl.sessionRescheduledEmail(
        data.recipientName,
        data.serviceName,
        fmtDate(data.oldDate),
        fmtDate(data.newDate),
        data.requestedByName,
        data.reason,
      ),
    });
  });
}

// =============================================================================
// Message notification with 10-minute debounce per conversation
// =============================================================================

/**
 * In-memory debounce map: threadId → last notification timestamp.
 * Thread IDs are deterministic (sorted user pair hash), so we
 * can throttle per-conversation reliably across messages.
 */
const messageNotifySentAt = new Map<string, number>();
const MESSAGE_DEBOUNCE_MS = 10 * 60 * 1000; // 10 minutes

/**
 * New chat message → email to recipient (debounced per conversation)
 */
export function notifyNewMessage(data: {
  threadId: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  preview: string;
}): void {
  const lastSent = messageNotifySentAt.get(data.threadId) ?? 0;
  if (Date.now() - lastSent < MESSAGE_DEBOUNCE_MS) return;

  messageNotifySentAt.set(data.threadId, Date.now());

  fireAndForget(async () => {
    await sendEmail({
      to: data.recipientEmail,
      subject: `New message from ${data.senderName}`,
      html: tpl.newMessageEmail(data.recipientName, data.senderName, data.preview),
    });
  });

  // Cleanup old entries every 100 entries to prevent unbounded growth
  if (messageNotifySentAt.size > 100) {
    const cutoff = Date.now() - MESSAGE_DEBOUNCE_MS;
    for (const [k, v] of messageNotifySentAt) {
      if (v < cutoff) messageNotifySentAt.delete(k);
    }
  }
}

/**
 * Fitness plan assigned → email to client
 */
export function notifyFitnessPlanAssigned(plan: {
  clientEmail: string;
  clientName: string;
  trainerName: string;
  exerciseCount: number;
  notes?: string;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: plan.clientEmail,
      subject: `New fitness plan from ${plan.trainerName}`,
      html: tpl.fitnessPlanAssignedEmail(
        plan.clientName,
        plan.trainerName,
        plan.exerciseCount,
        plan.notes,
      ),
    });
  });
}

/**
 * Fitness plan updated → email to client
 */
export function notifyFitnessPlanUpdated(plan: {
  clientEmail: string;
  clientName: string;
  trainerName: string;
  exerciseCount: number;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: plan.clientEmail,
      subject: "Your fitness plan has been updated",
      html: tpl.fitnessPlanUpdatedEmail(
        plan.clientName,
        plan.trainerName,
        plan.exerciseCount,
      ),
    });
  });
}

/**
 * Send daily digest to a trainer
 */
export function notifyTrainerDailyDigest(data: {
  trainerEmail: string;
  trainerName: string;
  todaySessions: { clientName: string; time: string; service: string }[];
  completedThisWeek: number;
  activeClients: number;
}): void {
  fireAndForget(async () => {
    await sendEmail({
      to: data.trainerEmail,
      subject: "Your Daily PhysiFit Briefing ☀️",
      html: tpl.trainerDailyDigestEmail(
        data.trainerName,
        data.todaySessions,
        data.completedThisWeek,
        data.activeClients,
      ),
    });
  });
}
