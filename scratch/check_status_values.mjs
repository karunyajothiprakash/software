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
  const { data, error } = await supabase.rpc('get_column_type', { table_name: 'export_orders', column_name: 'status' });
  // If RPC doesn't exist, I'll just try to select and check the type if possible, or just assume it's text if 'pending' works.
  console.log("Status values in DB:", await supabase.from('export_orders').select('status'));
}

check();
