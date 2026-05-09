import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: products, error: pError } = await supabase.from('products').select('id, name, is_active');
  const { data: warehouses, error: wError } = await supabase.from('warehouses').select('id, name, is_active');
  const { data: profiles, error: prError } = await supabase.from('profiles').select('id, company_id');

  console.log("Products:", products);
  console.log("Warehouses:", warehouses);
  console.log("Profiles (sample):", profiles?.slice(0, 5));
}

checkData();
