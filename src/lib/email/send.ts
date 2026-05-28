import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Send a transactional email via Resend.
 *
 * Fire-and-forget: callers should `.catch(console.error)` and never await
 * in the critical path. When RESEND_API_KEY is not configured, this is a
 * no-op that resolves immediately.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const client = getClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[email-skip] RESEND_API_KEY not set. Would send to=${JSON.stringify(opts.to)} subj="${opts.subject}"`
      );
    }
    return;
  }

  const toAddresses = Array.isArray(opts.to) ? opts.to : [opts.to];

  try {
    const { error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: toAddresses,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      console.error(`[email-error] Failed to send "${opts.subject}":`, error);
    }
  } catch (err) {
    console.error(`[email-error] Exception sending "${opts.subject}":`, err);
  }
}
