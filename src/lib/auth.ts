import { randomBytes, createHash } from "crypto";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { db } from "@/db/client";
import { authSessions } from "@/db/schema";

// 32 bytes -> 256 bits of entropy; base64url-encoded for cookie safety.
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Argon2id with Node-RS defaults (memory 19 MiB, time 2, parallelism 1).
// These are conservative for serverless cold-start latency; tune up if abuse seen.
export async function hashPassword(plain: string): Promise<string> {
  return argonHash(plain, { algorithm: 2 /* Argon2id */ });
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    return await argonVerify(stored, plain);
  } catch {
    return false;
  }
}

export type SessionLifetime = {
  /** Absolute max session age, e.g. 30 days */
  absoluteSeconds: number;
};

export async function createSession(
  userId: string,
  meta: { ip: string | null; userAgent: string | null },
  lifetime: SessionLifetime = { absoluteSeconds: 60 * 60 * 24 * 30 }
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + lifetime.absoluteSeconds * 1000);

  await db.insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt,
    ip: meta.ip ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  return { token, expiresAt };
}
