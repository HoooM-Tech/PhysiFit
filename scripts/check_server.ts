import 'dotenv/config';

async function main() {
  const base = process.env.DEV_BASE_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(base);
    console.log('Status', res.status);
    const t = await res.text();
    console.log('Length of body', t.length);
  } catch (err) {
    console.error('Fetch error', err);
    process.exit(1);
  }
}
main();
