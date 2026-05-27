import { config } from "dotenv";
import { existsSync } from "fs";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

import type { Config } from "drizzle-kit";

// DATABASE_URL is only required for `migrate`/`push`/`studio`. `generate` works
// from the schema files alone, so we fall back to a placeholder to let codegen
// run in fresh checkouts before secrets are configured.
const url =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/placeholder";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
} satisfies Config;
