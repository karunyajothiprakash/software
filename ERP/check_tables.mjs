import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sxebygxpjzntogzpjnga.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: tables, error } = await supabase.rpc('get_tables'); // This might not work if RPC doesn't exist
  // Let's just try to select from both
  const res1 = await supabase.from('shipments').select('count', { count: 'exact', head: true });
  const res2 = await supabase.from('export_shipments').select('count', { count: 'exact', head: true });
  
  console.log("shipments exists:", !res1.error);
  console.log("export_shipments exists:", !res2.error);
}

check();
