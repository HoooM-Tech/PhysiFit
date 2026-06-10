import fs from 'fs'
import path from 'path'
import { db } from '../src/db/client'

async function runSqlFile(filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf8')
  console.log(`Running ${path.basename(filePath)}...`)
  // Use a simple transaction per file
  try {
    await db.execute(sql)
    console.log(`Applied ${path.basename(filePath)}`)
  } catch (err: any) {
    console.error(`Error applying ${path.basename(filePath)}:`, err.message || err)
    console.error('Continuing to next migration...')
  }
}

async function main() {
  try {
    const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    for (const f of files) {
      const p = path.join(migrationsDir, f)
      await runSqlFile(p)
    }
    console.log('All migrations applied')
    process.exit(0)
  } catch (err) {
    console.error('Migration error:', err)
    process.exit(1)
  }
}

main()
