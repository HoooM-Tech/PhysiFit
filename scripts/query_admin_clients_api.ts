import "dotenv/config";
import { db } from "../src/db/client";
import { users, clientProfiles } from "../src/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { eq, ne, and } from "drizzle-orm";

async function main() {
  const trainerUsers = alias(users, 'trainer_users');
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      status: users.status,
      createdAt: users.createdAt,
      profile: {
        id: clientProfiles.id,
        weightKg: clientProfiles.weightKg,
        heightCm: clientProfiles.heightCm,
        dizzinessHistory: clientProfiles.dizzinessHistory,
        medicalNotes: clientProfiles.medicalNotes,
        assignedTrainerId: clientProfiles.assignedTrainerId,
      },
      assignedTrainerName: trainerUsers.fullName,
    })
    .from(users)
    .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
    .leftJoin(trainerUsers, eq(trainerUsers.id, clientProfiles.assignedTrainerId))
    .where(
      and(
        eq(users.role, 'client'),
        ne(users.passwordHash, 'placeholder_guest_account_hash')
      )
    )
    .orderBy(users.fullName);

  console.log('Rows returned:', rows.length);
  console.dir(rows, { depth: 2 });
}

main().catch((err) => { console.error(err); process.exit(1); }).then(() => process.exit(0));
