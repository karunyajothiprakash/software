import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, biometric_id');
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}
run();
