require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { getPool } = require('../src/services/db');

async function main() {
  const pool = getPool();

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
  );

  for (const file of files) {
    const { rows } = await pool.query('SELECT filename FROM schema_migrations WHERE filename=$1', [file]);
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // run each migration as a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES($1)', [file]);
      await client.query('COMMIT');
      // eslint-disable-next-line no-console
      console.log(`Applied migration: ${file}`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
