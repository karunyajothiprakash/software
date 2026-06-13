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
    console.log("=== Checking Replication Slots ===");
    const slots = await pool.query('SELECT * FROM pg_replication_slots');
    console.log(slots.rows);

    console.log("\n=== Checking Publications ===");
    const pubs = await pool.query('SELECT * FROM pg_publication');
    console.log(pubs.rows);

    console.log("\n=== Checking Subscriptions ===");
    try {
      const subs = await pool.query('SELECT * FROM pg_subscription');
      console.log(subs.rows);
    } catch (e) {
      console.log("Could not query pg_subscription:", e.message);
    }

    console.log("\n=== Checking Foreign Data Wrapper Servers ===");
    const fdw = await pool.query('SELECT * FROM pg_foreign_server');
    console.log(fdw.rows);

  } catch (err) {
    console.error("ERROR QUERYING DB:", err.message);
  } finally {
    await pool.end();
  }
}

run();
