import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { users } from "../src/db/schema";

async function run() {
  const adminEmail = "admin@physifit.ng";
  const newEmail = "info.physifitservices@gmail.com";

  // Fetch the admin password hash
  const [adminUser] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!adminUser) {
    console.error(`Error: Admin user ${adminEmail} not found!`);
    process.exit(1);
  }

  // Check if new user already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, newEmail))
    .limit(1);

  if (existingUser) {
    // If it exists, update it to super_admin and set password hash
    await db
      .update(users)
      .set({
        role: "super_admin",
        passwordHash: adminUser.passwordHash,
        status: "active"
      })
      .where(eq(users.id, existingUser.id));
    console.log(`✓ Updated existing user ${newEmail} to super_admin role and synced password.`);
  } else {
    // Insert new super_admin
    await db.insert(users).values({
      email: newEmail,
      passwordHash: adminUser.passwordHash,
      fullName: "PhysiFit Services Super Admin",
      role: "super_admin",
      status: "active",
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Successfully created new super_admin: ${newEmail}`);
  }
}

run()
  .catch((err) => {
    console.error("Execution failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
