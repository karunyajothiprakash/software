import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ override: true });

const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
  } else {
    console.log("Auth Users:");
    users.forEach(u => {
      console.log(`Email: ${u.email}, ID: ${u.id}, CreatedAt: ${u.created_at}`);
    });
  }
}
run();
