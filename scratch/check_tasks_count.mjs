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
    const res = await pool.query('SELECT COUNT(*), COUNT(CASE WHEN is_deleted = false THEN 1 END) as active FROM crm_tasks');
    console.log("crm_tasks table count:", res.rows[0]);
    
    // Also let's check a few sample tasks
    const samples = await pool.query('SELECT id, title, company_id, assigned_to, is_deleted, created_at FROM crm_tasks LIMIT 5');
    console.log("Samples:", samples.rows);
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
