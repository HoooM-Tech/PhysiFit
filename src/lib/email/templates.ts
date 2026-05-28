import { env } from "@/lib/env";

// =============================================================================
// Branded HTML email template system for PhysiFit transactional emails.
// Uses inline CSS for maximum email client compatibility.
// =============================================================================

const BRAND_BLUE = "#2563EB";
const BRAND_DARK = "#1e293b";
const BRAND_LIGHT_BG = "#f8fafc";
const APP_URL = () => {
  const url = env.PUBLIC_APP_URL;
  if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
    return "https://physifit.co";
  }
  return url;
};

/**
 * Wraps email body content in a branded PhysiFit layout.
 */
export function baseTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND_LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BRAND_LIGHT_BG};">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,${BRAND_BLUE},#1d4ed8);padding:28px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
            PhysiFit
          </h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">${title}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:${BRAND_DARK};font-size:15px;line-height:1.7;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:${BRAND_LIGHT_BG};border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
            This email was sent by <a href="${APP_URL()}" style="color:${BRAND_BLUE};text-decoration:none;">PhysiFit</a>.
            You are receiving this because of your account activity.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Reusable CTA button */
function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:${BRAND_BLUE};border-radius:10px;padding:12px 28px;">
      <a href="${url}" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;">${text}</a>
    </td></tr>
  </table>`;
}

/** Detail row for info blocks */
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">${value}</td>
  </tr>`;
}

/** Info block with key-value pairs */
function infoBlock(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${BRAND_LIGHT_BG};border-radius:10px;padding:16px;margin:16px 0;">
    ${rows.map(([l, v]) => detailRow(l, v)).join("")}
  </table>`;
}

// =============================================================================
// Template functions
// =============================================================================

export function welcomeEmail(fullName: string, role: string): string {
  return baseTemplate("Welcome to PhysiFit", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Welcome, ${fullName}! 🎉</h2>
    <p>Your <strong>${role}</strong> account has been created successfully on PhysiFit.</p>
    ${role === "trainer"
      ? `<p>Your trainer profile is now <strong>pending admin approval</strong>. You'll receive an email once approved and can then begin receiving client assignments.</p>`
      : `<p>You're all set to explore our fitness programs, book sessions, and start your wellness journey.</p>`
    }
    ${ctaButton("Go to PhysiFit", APP_URL())}
  `);
}

export function adminNewRegistrationEmail(fullName: string, email: string, role: string): string {
  return baseTemplate("New Registration", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">New ${role} registered</h2>
    ${infoBlock([
    ["Name", fullName],
    ["Email", email],
    ["Role", role.charAt(0).toUpperCase() + role.slice(1)],
  ])}
    ${ctaButton("View in Admin Dashboard", `${APP_URL()}/admin`)}
  `);
}

export function trainerApprovedEmail(fullName: string): string {
  return baseTemplate("Account Approved!", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Congratulations, ${fullName}! 🎉</h2>
    <p>Your PhysiFit trainer account has been <strong style="color:#16a34a;">approved</strong> by an admin.</p>
    <p>You can now receive client assignments, manage sessions, and build fitness plans.</p>
    ${ctaButton("Open Trainer Portal", `${APP_URL()}/trainer-portal`)}
  `);
}

export function bookingConfirmationEmail(
  clientName: string,
  serviceName: string,
  sessionCount: number,
  startDate: string,
  totalAmountNaira: number,
): string {
  return baseTemplate("Booking Confirmed", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Booking Confirmed! ✅</h2>
    <p>Hi ${clientName}, your sessions have been booked successfully.</p>
    ${infoBlock([
    ["Program", serviceName],
    ["Sessions", `${sessionCount} session${sessionCount > 1 ? "s" : ""}`],
    ["Start Date", startDate],
    ["Total Amount", `₦${totalAmountNaira.toLocaleString()}`],
  ])}
    <p style="font-size:13px;color:#64748b;">Your trainer will be assigned shortly by our admin team.</p>
    ${ctaButton("View Dashboard", `${APP_URL()}/dashboard`)}
  `);
}

export function adminBookingEmail(
  clientName: string,
  clientEmail: string,
  serviceName: string,
  sessionCount: number,
  totalAmountNaira: number,
): string {
  return baseTemplate("New Booking Received", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">New Booking 📋</h2>
    ${infoBlock([
    ["Client", clientName],
    ["Email", clientEmail],
    ["Program", serviceName],
    ["Sessions", `${sessionCount}`],
    ["Amount", `₦${totalAmountNaira.toLocaleString()}`],
  ])}
    ${ctaButton("Manage in Admin", `${APP_URL()}/admin`)}
  `);
}

export function paymentConfirmedEmail(
  name: string,
  amountNaira: number,
  providerRef: string,
): string {
  return baseTemplate("Payment Confirmed", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Payment Received ✅</h2>
    <p>Hi ${name}, your payment has been confirmed.</p>
    ${infoBlock([
    ["Amount", `₦${amountNaira.toLocaleString()}`],
    ["Reference", providerRef],
  ])}
    ${ctaButton("View Dashboard", `${APP_URL()}/dashboard`)}
  `);
}

export function adminPaymentEmail(
  clientName: string,
  amountNaira: number,
  providerRef: string,
): string {
  return baseTemplate("Payment Received", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Payment Received 💰</h2>
    ${infoBlock([
    ["Client", clientName],
    ["Amount", `₦${amountNaira.toLocaleString()}`],
    ["Reference", providerRef],
  ])}
    ${ctaButton("View in Admin", `${APP_URL()}/admin`)}
  `);
}

export function sessionCompletedEmail(
  clientName: string,
  trainerName: string,
  serviceName: string,
  date: string,
): string {
  return baseTemplate("Session Completed", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Session Completed ✅</h2>
    <p>Hi ${clientName}, your session has been verified and completed.</p>
    ${infoBlock([
    ["Trainer", trainerName],
    ["Program", serviceName],
    ["Date", date],
  ])}
    <p>Great work! Keep it up 💪</p>
    ${ctaButton("View Progress", `${APP_URL()}/dashboard`)}
  `);
}

export function sessionCancelledClientEmail(
  clientName: string,
  trainerName: string,
  serviceName: string,
  date: string,
  reason?: string,
): string {
  return baseTemplate("Session Cancelled", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Session Cancelled</h2>
    <p>Hi ${clientName}, your upcoming session has been cancelled by your trainer.</p>
    ${infoBlock([
    ["Trainer", trainerName],
    ["Program", serviceName],
    ["Scheduled Date", date],
    ...(reason ? [["Reason", reason] as [string, string]] : []),
  ])}
    <p style="font-size:13px;color:#64748b;">Your session will be rescheduled. If you have any questions, please contact your trainer via the messaging feature.</p>
    ${ctaButton("View Dashboard", `${APP_URL()}/dashboard`)}
  `);
}

export function adminSessionCancelledEmail(
  trainerName: string,
  clientName: string,
  serviceName: string,
  date: string,
  reason?: string,
): string {
  return baseTemplate("Session Cancelled by Trainer", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Session Cancelled ⚠️</h2>
    ${infoBlock([
    ["Trainer", trainerName],
    ["Client", clientName],
    ["Program", serviceName],
    ["Date", date],
    ...(reason ? [["Reason", reason] as [string, string]] : []),
  ])}
    ${ctaButton("Manage Sessions", `${APP_URL()}/admin`)}
  `);
}

export function sessionRescheduledEmail(
  recipientName: string,
  serviceName: string,
  oldDate: string,
  newDate: string,
  requestedBy: string,
  reason?: string,
): string {
  return baseTemplate("Session Rescheduled", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Session Rescheduled 📅</h2>
    <p>Hi ${recipientName}, a session has been rescheduled.</p>
    ${infoBlock([
    ["Program", serviceName],
    ["Previous Date", `<span style="text-decoration:line-through;color:#94a3b8;">${oldDate}</span>`],
    ["New Date", `<strong style="color:#16a34a;">${newDate}</strong>`],
    ["Rescheduled By", requestedBy],
    ...(reason ? [["Reason", reason] as [string, string]] : []),
  ])}
    ${ctaButton("View Schedule", `${APP_URL()}/dashboard`)}
  `);
}

export function newMessageEmail(recipientName: string, senderName: string, preview: string): string {
  const truncated = preview.length > 120 ? preview.slice(0, 120) + "…" : preview;
  return baseTemplate("New Message", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">New message from ${senderName}</h2>
    <p>Hi ${recipientName},</p>
    <div style="background:${BRAND_LIGHT_BG};border-left:4px solid ${BRAND_BLUE};border-radius:8px;padding:16px;margin:16px 0;font-size:14px;color:#475569;">
      "${truncated}"
    </div>
    ${ctaButton("View Conversation", `${APP_URL()}/dashboard`)}
    <p style="font-size:11px;color:#94a3b8;">You won't receive another email for this conversation for the next 10 minutes.</p>
  `);
}

export function fitnessPlanAssignedEmail(
  clientName: string,
  trainerName: string,
  exerciseCount: number,
  notes?: string,
): string {
  return baseTemplate("New Fitness Plan", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">New Fitness Plan Assigned 📋</h2>
    <p>Hi ${clientName}, your trainer <strong>${trainerName}</strong> has created a personalized fitness plan for you.</p>
    ${infoBlock([
    ["Trainer", trainerName],
    ["Exercises", `${exerciseCount} exercise${exerciseCount > 1 ? "s" : ""}`],
    ...(notes ? [["Notes", notes.slice(0, 200)] as [string, string]] : []),
  ])}
    ${ctaButton("View Plan", `${APP_URL()}/dashboard`)}
  `);
}

export function fitnessPlanUpdatedEmail(
  clientName: string,
  trainerName: string,
  exerciseCount: number,
): string {
  return baseTemplate("Fitness Plan Updated", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Your Fitness Plan Was Updated ✏️</h2>
    <p>Hi ${clientName}, your trainer <strong>${trainerName}</strong> has updated your fitness plan.</p>
    ${infoBlock([
    ["Trainer", trainerName],
    ["Exercises", `${exerciseCount} exercise${exerciseCount > 1 ? "s" : ""}`],
  ])}
    <p style="font-size:13px;color:#64748b;">Check your updated plan to see the latest exercises and notes.</p>
    ${ctaButton("View Plan", `${APP_URL()}/dashboard`)}
  `);
}

export function trainerDailyDigestEmail(
  trainerName: string,
  todaySessions: { clientName: string; time: string; service: string }[],
  completedThisWeek: number,
  activeClients: number,
): string {
  const sessionRows = todaySessions.length > 0
    ? todaySessions.map(s =>
      `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${s.time}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;">${s.clientName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">${s.service}</td>
        </tr>`
    ).join("")
    : `<tr><td colspan="3" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No sessions scheduled today 🎉</td></tr>`;

  return baseTemplate("Your Daily Briefing", `
    <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_DARK};">Good morning, ${trainerName}! ☀️</h2>
    <p>Here's your daily briefing for ${new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}.</p>

    <div style="display:flex;gap:12px;margin:16px 0;">
      <div style="flex:1;background:#eff6ff;border-radius:10px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND_BLUE};">${todaySessions.length}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;">Today's Sessions</p>
      </div>
      <div style="flex:1;background:#f0fdf4;border-radius:10px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:24px;font-weight:700;color:#16a34a;">${completedThisWeek}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;">Completed (7d)</p>
      </div>
      <div style="flex:1;background:#fefce8;border-radius:10px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:24px;font-weight:700;color:#ca8a04;">${activeClients}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;">Active Clients</p>
      </div>
    </div>

    <h3 style="margin:24px 0 8px;font-size:15px;color:${BRAND_DARK};">Today's Schedule</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${BRAND_LIGHT_BG};border-radius:10px;overflow:hidden;">
      <tr style="background:#e2e8f0;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Time</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Client</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Program</th>
      </tr>
      ${sessionRows}
    </table>

    ${ctaButton("Open Trainer Portal", `${APP_URL()}/trainer-portal`)}
  `);
}

export function eventConfirmationEmail(): string {
  return baseTemplate("Event Confirmation & Access Details", `
    <p>Dear Participant,</p>
    <p>Congratulations on successfully registering for the <strong>Move Safer, Live Stronger</strong> Fitness & Wellness Event by Physifit Nigeria!</p>
    <p>We are excited to welcome you to this special wellness experience.</p>
    
    <p>Please find your event details below:</p>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${BRAND_LIGHT_BG};border-radius:10px;padding:16px;margin:16px 0;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px;vertical-align:top;">📅 Event:</td>
        <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">Move Safer, Live Stronger</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px;vertical-align:top;">📅 Date:</td>
        <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">Saturday, 27th June 2026</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px;vertical-align:top;">🕗 Time:</td>
        <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">8:00 AM – 10:00 AM</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px;vertical-align:top;">📍 Venue:</td>
        <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">
          Preskon Hotel, Victoria Island (VI)<br/>
          <a href="https://maps.app.goo.gl/kuruFYeEQwcwcHXu6?g_st=ic" style="color:${BRAND_BLUE};text-decoration:none;word-break:break-all;">https://maps.app.goo.gl/kuruFYeEQwcwcHXu6?g_st=ic</a>
        </td>
      </tr>
    </table>
    
    <p>This message serves as your event access confirmation. Kindly present it at the venue upon arrival.</p>
    <p>We look forward to having you join us for an engaging and enriching experience.</p>
    
    <p style="margin-top:24px;">Warm regards,<br/><strong>Physifit Nigeria</strong></p>
  `);
}

