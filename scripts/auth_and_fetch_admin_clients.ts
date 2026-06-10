import "dotenv/config";
// Node 18+ provides global fetch; no external dependency required.
import { db } from "../src/db/client";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { createSession, hashToken } from "../src/lib/auth";

async function main() {
  // find admin user
  const [admin] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, 'admin@physifit.ng')).limit(1);
  if (!admin) {
    console.error('Admin user not found. Run npm run db:seed');
    process.exit(1);
  }

  // create session for admin
  const { token, expiresAt } = await createSession(admin.id, { ip: null, userAgent: 'script' });
  const cookieValue = `session=${token}; Path=/; HttpOnly`;
  console.log('Created session token (will not print token for safety)');

  // Call the API on the dev server (assumes running on localhost:3001)
  const base = process.env.DEV_BASE_URL ?? 'http://localhost:3001';
  const res = await fetch(`${base}/api/admin/clients`, {
    method: 'GET',
    headers: { Cookie: cookieValue },
  });

  console.log('Status:', res.status);
  const json = await res.text();
  console.log('Body:', json);
}

main().catch(err => { console.error(err); process.exit(1); });
