import { db } from '../src/db/client'
import { users, passwordResets } from '../src/db/schema'
import { hashPassword, generateSessionToken, hashToken } from '../src/lib/auth'
import { eq } from 'drizzle-orm'

async function main() {
  const testEmail = `smoke-test+${Date.now()}@example.com`
  console.log('Creating test user:', testEmail)
  const pwd = 'TempPass123!'
  const pwdHash = await hashPassword(pwd)

  const [u] = await db.insert(users).values({
    email: testEmail,
    passwordHash: pwdHash,
    fullName: 'Smoke Test User',
    role: 'client',
    phone: null,
  }).returning({ id: users.id, email: users.email })

  if (!u) {
    console.error('Failed to create user')
    process.exit(1)
  }

  console.log('User created with id', u.id)

  // Trigger forgot-password logic: create token and insert into password_resets
  const token = generateSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await db.insert(passwordResets).values({ userId: u.id, tokenHash, expiresAt })

  console.log('Inserted password_resets token, token (plain):', token)

  // Verify
  const rows = await db.select().from(passwordResets).where(eq(passwordResets.userId, u.id))
  console.log('password_resets rows for user:', rows.length)
  for (const r of rows) {
    console.log({ id: r.id, used: r.used, expiresAt: r.expiresAt })
  }

  // Cleanup: remove password_resets and user
  await db.delete(passwordResets).where(eq(passwordResets.userId, u.id))
  await db.delete(users).where(eq(users.id, u.id))
  console.log('Cleaned up test rows')
}

main().catch(err => { console.error(err); process.exit(1) })
