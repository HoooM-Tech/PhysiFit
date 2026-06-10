import "dotenv/config";
import { pool } from "../src/db/client";
import { readFileSync } from "fs";

async function main() {
  const sql = readFileSync('./src/db/migrations/0002_add_client_specialization.sql', 'utf8');
  console.log('Running migration SQL:\n', sql);
  const res = await pool.query(sql);
  console.log('Migration result:', res);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}).then(() => process.exit(0));
