import { createHash } from "crypto";
import { env } from "@/lib/env";

export type MailchimpMergeFields = Record<string, string | number | undefined>;

export type MailchimpSubscriber = {
  email: string;
  mergeFields?: MailchimpMergeFields;
  tags?: string[];
};

export function isMailchimpConfigured(): boolean {
  return Boolean(
    env.MAILCHIMP_API_KEY && env.MAILCHIMP_AUDIENCE_ID && env.MAILCHIMP_SERVER_PREFIX
  );
}

function subscriberHash(email: string): string {
  return createHash("md5").update(email.toLowerCase().trim()).digest("hex");
}

function basicAuthHeader(apiKey: string): string {
  // Mailchimp accepts any non-empty username; the API key is the password.
  return "Basic " + Buffer.from(`anystring:${apiKey}`).toString("base64");
}

function stripUndefined(obj: MailchimpMergeFields): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

/**
 * Upsert (PUT) a member into the configured audience. Idempotent — running it
 * twice for the same email updates the existing record.
 *
 * Throws on non-2xx so the caller can capture the error message. Callers are
 * expected to treat this as best-effort: persist the DB record first, then
 * attempt the sync.
 */
export async function upsertMailchimpMember(input: MailchimpSubscriber): Promise<void> {
  if (!isMailchimpConfigured()) {
    throw new Error("Mailchimp is not configured");
  }
  const { MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX } = env;
  const hash = subscriberHash(input.email);
  const base = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: basicAuthHeader(MAILCHIMP_API_KEY!),
  };

  // 1. Upsert member with merge fields + subscribed status.
  const memberRes = await fetch(
    `${base}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${hash}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        email_address: input.email,
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: stripUndefined(input.mergeFields ?? {}),
      }),
    }
  );

  if (!memberRes.ok) {
    const text = await memberRes.text().catch(() => "");
    throw new Error(
      `Mailchimp member upsert failed (${memberRes.status}): ${text.slice(0, 500)}`
    );
  }

  // 2. Apply tags (active = present). Skip if none.
  if (input.tags && input.tags.length > 0) {
    const tagRes = await fetch(
      `${base}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${hash}/tags`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          tags: input.tags.map((name) => ({ name, status: "active" })),
        }),
      }
    );
    if (!tagRes.ok) {
      const text = await tagRes.text().catch(() => "");
      throw new Error(
        `Mailchimp tag update failed (${tagRes.status}): ${text.slice(0, 500)}`
      );
    }
  }
}
