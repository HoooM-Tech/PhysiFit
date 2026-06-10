import "dotenv/config";
import { db } from "../src/db/client";
import { users, clientProfiles } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log('Querying clients...');
  const clients = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt, phone: users.phone })
    .from(users)
    .where(eq(users.role, 'client'))
    .limit(50);

  console.log('Clients found:', clients.length);
  console.dir(clients, { depth: 2 });

  const profiles = await db
    .select()
    .from(clientProfiles)
    .limit(50);

  console.log('Client profiles found:', profiles.length);
  console.dir(profiles, { depth: 2 });

  const admins = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(10);

  console.log('Admin users:', admins.length);
  console.dir(admins, { depth: 2 });
}

main()
  .catch((err) => {
    console.error('Error querying DB:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
