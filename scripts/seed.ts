/**
 * Idempotent seed script. Safe to re-run.
 *
 * Seeds:
 *   - 3 services (Senior, Postpartum, Corporate)
 *   - 1 admin user
 *   - 1 upcoming event (Wellness Day)
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { services, users, events } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

const SERVICES = [
  {
    slug: "senior-fitness",
    name: "Senior Fitness",
    description:
      "Low-impact strength, balance, and mobility programming for adults 55+. Includes a physical assessment.",
    priceNairaPerSession: 33333,
  },
  {
    slug: "postpartum-fitness",
    name: "Postpartum Fitness",
    description:
      "Core re-engagement, pelvic-floor recovery, and progressive strength training for new mothers.",
    priceNairaPerSession: 33333,
  },
  {
    slug: "corporate-wellness",
    name: "Corporate Wellness",
    description:
      "Group sessions for teams — energy, stress relief, posture, and movement at the workplace.",
    priceNairaPerSession: 33333,
  },
] as const;

async function seedServices() {
  for (const s of SERVICES) {
    await db
      .insert(services)
      .values(s)
      .onConflictDoUpdate({
        target: services.slug,
        set: {
          name: s.name,
          description: s.description,
          priceNairaPerSession: s.priceNairaPerSession,
          active: true,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`✓ Seeded ${SERVICES.length} services`);
}

async function seedAdmin() {
  const email = "admin@physifit.ng";
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    await db
      .update(users)
      .set({ role: "super_admin" })
      .where(eq(users.id, existing.id));
    console.log(`✓ Admin role updated to super_admin: ${email}`);
    return;
  }
  const tempPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!tempPassword || tempPassword.length < 10) {
    console.warn(
      "⚠ Skipping admin seed: set SEED_ADMIN_PASSWORD (>=10 chars) in env to create the admin account"
    );
    return;
  }
  await db.insert(users).values({
    email,
    passwordHash: await hashPassword(tempPassword),
    fullName: "PhysiFit Admin",
    role: "super_admin",
    status: "active",
    emailVerifiedAt: new Date(),
  });
  console.log(`✓ Created admin: ${email}`);
}

async function seedEvent() {
  const name = "Wellness Day 2026";
  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.name, name))
    .limit(1);
  if (existing) {
    await db
      .update(events)
      .set({ priceNaira: 50000 })
      .where(eq(events.id, existing.id));
    console.log(`✓ Event updated to 50000: ${name}`);
    return;
  }
  await db.insert(events).values({
    name,
    description: "A full day of guided wellness stations: balance, cognition, coordination, mobility, endurance, and social activities.",
    eventDate: "2026-06-27",
    startTime: "08:00:00",
    endTime: "10:00:00",
    venueRevealedOnRegister: true,
    venueAddress: "Venue revealed via email after registration",
    capacity: 50,
    priceNaira: 50000,
  });
  console.log(`✓ Created event: ${name}`);
}

async function main() {
  console.log("Seeding database...");
  await seedServices();
  await seedAdmin();
  await seedEvent();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
