import { z } from "zod";
import { config } from "dotenv";
import { existsSync } from "fs";

if (process.env.NODE_ENV !== "production") {
  if (existsSync(".env.local")) {
    config({ path: ".env.local" });
  } else {
    config();
  }
}

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((v) => v.startsWith("postgres://") || v.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a Postgres connection string",
    }),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 bytes"),
  PUBLIC_APP_URL: z.string().url(),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SESSION_INACTIVITY_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(3600),
  RATE_LIMIT_DEFAULT_PER_MINUTE: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_AUTH_PER_MINUTE: z.coerce.number().int().positive().default(10),
  PAYSTACK_SECRET_KEY: z.string().min(1, "PAYSTACK_SECRET_KEY is required"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1, "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is required"),
  // Mailchimp — optional. When all three are set, event PAR-Q submissions are
  // synced to the configured audience. When any is missing, sync is skipped
  // silently and the DB record still saves.
  MAILCHIMP_API_KEY: z.string().min(1).optional(),
  MAILCHIMP_AUDIENCE_ID: z.string().min(1).optional(),
  MAILCHIMP_SERVER_PREFIX: z
    .string()
    .regex(/^[a-z]{2}\d+$/i, "MAILCHIMP_SERVER_PREFIX must look like 'us21'")
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const envObj = { ...process.env };

  // If in Next.js build phase, supply safe mock placeholders for required environment variables if they are missing.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    if (!envObj.DATABASE_URL) {
      envObj.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/physifit";
    }
    if (!envObj.SESSION_SECRET) {
      envObj.SESSION_SECRET = "placeholder_session_secret_32_characters_long_minimum";
    }
    if (!envObj.PUBLIC_APP_URL) {
      envObj.PUBLIC_APP_URL = "http://localhost:3000";
    }
    if (!envObj.PAYSTACK_SECRET_KEY) {
      envObj.PAYSTACK_SECRET_KEY = "placeholder_paystack_secret_key";
    }
    if (!envObj.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      envObj.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = "placeholder_paystack_public_key";
    }
  }

  const parsed = envSchema.safeParse(envObj);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}\n\nSee .env.example for the required variables.`);
  }
  return parsed.data;
}

export const env = loadEnv();
