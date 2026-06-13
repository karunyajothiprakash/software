const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let dir = __dirname;
let envPath;
while (dir) {
  const check = path.join(dir, '.env');
  if (fs.existsSync(check)) {
    envPath = check;
    break;
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (envPath) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const pool = new Pool({
  user: 'erp_admin',
  host: process.env.PG_HOST || '127.0.0.1',
  database: 'shastika_erp',
  password: process.env.PG_PASSWORD,
  port: 5432,
});

// Helper for single queries
module.exports = {
  query: (text, params) => pool.query(text, params),
};
