import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ override: true });

const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function updateIds() {
  console.log("Updating Biometric IDs in Supabase...");

  // 1. Update Preethi M (biometric_id: '1013')
  const { error: preethiErr } = await supabase
    .from('profiles')
    .update({ biometric_id: '1013' })
    .eq('full_name', 'Preethi M');

  if (preethiErr) {
    console.error("❌ Failed to update Preethi M:", preethiErr.message);
  } else {
    console.log("✅ Preethi M updated to Biometric ID 1013.");
  }

  // 2. Update Jayasri S (biometric_id: '1003')
  const { error: jayasriErr } = await supabase
    .from('profiles')
    .update({ biometric_id: '1003' })
    .eq('full_name', 'Jayasri S');

  if (jayasriErr) {
    console.error("❌ Failed to update Jayasri S:", jayasriErr.message);
  } else {
    console.log("✅ Jayasri S updated to Biometric ID 1003.");
  }

  console.log("\n🎉 Mapping updates complete!");
}

updateIds();
