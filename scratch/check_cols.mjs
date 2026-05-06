import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://sxebygxpjzntogzpjnga.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4"
);

async function check() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'export_shipments' });
  // If RPC doesn't exist, we try a query
  if (error) {
     const { data: sample } = await supabase.from('export_shipments').select('*').limit(1);
     console.log('Sample shipment:', sample);
  } else {
     console.log('Columns:', data);
  }
}

check();
