import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  'https://sxebygxpjzntogzpjnga.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    const { data, count, error } = await supabase
      .from('crm_tasks')
      .select('*', { count: 'exact' });
      
    if (error) throw error;
    console.log("Supabase crm_tasks count:", count);
    console.log("Supabase crm_tasks sample:", data.slice(0, 5));
  } catch (err) {
    console.error("Supabase query error:", err.message);
  }
}

run();
