/**
 * DocuDex — Seed demo user
 * Run: node scripts/seed-demo.js
 *
 * Reads DB config from apps/backend/.env (falls back to defaults).
 * Safe to run multiple times — uses ON CONFLICT DO UPDATE.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../apps/backend/.env') });

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'docudex',
    user:     process.env.DB_USER     || 'docudex',
    password: process.env.DB_PASSWORD || 'docudex_pass',
  });

  await client.connect();

  const hash = await bcrypt.hash('Demo@12345', 10);

  await client.query(
    `INSERT INTO users (email, full_name, password_hash, role, is_email_verified)
     VALUES ($1, $2, $3, 'user', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['demo@docudex.com', 'Demo User', hash]
  );

  console.log('  ✅ Demo user ready: demo@docudex.com / Demo@12345');
  await client.end();
}

main().catch(err => {
  console.error('  ❌ Seed error:', err.message);
  process.exit(1);
});
