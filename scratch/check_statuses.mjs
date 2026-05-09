import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [k, ...v] = line.split('=');
      return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('export_orders').select('status').limit(10);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Statuses:", data.map(o => o.status));
  }
}

check();
