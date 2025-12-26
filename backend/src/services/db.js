const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const err = new Error('DATABASE_URL is not configured');
    err.statusCode = 500;
    throw err;
  }

  const pgsslRaw = String(process.env.PGSSL || '').trim().toLowerCase();
  const useSsl = pgsslRaw === 'true' || pgsslRaw === '1' || pgsslRaw === 'yes';

  pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

module.exports = {
  getPool,
  query,
};
