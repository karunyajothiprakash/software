import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'erp_admin',
  host: '195.35.22.13',
  database: 'shastika_erp',
  password: 'Shastika2026',
  port: 5432,
});

async function run() {
  try {
    console.log("Connecting to VPS PostgreSQL...");
    const res = await pool.query('SELECT NOW()');
    console.log("SUCCESS! Current time on VPS DB:", res.rows[0].now);
  } catch (err) {
    console.error("CONNECTION FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

run();
