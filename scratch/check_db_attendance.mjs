import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load env
const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function checkAttendance() {
  console.log("=== PROFILES IN DB ===");
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, biometric_id, status, requested_role');
  
  if (profErr) {
    console.error("Error fetching profiles:", profErr);
    return;
  }
  console.log(profiles);

  console.log("\n=== ATTENDANCE LOGS IN DB ===");
  const { data: logs, error: logsErr } = await supabase
    .from('attendance_logs')
    .select('*')
    .order('date', { ascending: false });

  if (logsErr) {
    console.error("Error fetching attendance logs:", logsErr);
    return;
  }
  console.log(`Total attendance logs: ${logs?.length}`);
  if (logs && logs.length > 0) {
    console.log("Recent logs count:", logs.length);
    console.log("Recent 50 logs:", logs.slice(0, 50));
  }
}

checkAttendance();
