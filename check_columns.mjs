import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sxebygxpjzntogzpjnga.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('export_orders').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("export_orders columns:", Object.keys(data[0]));
  } else {
    console.log("No data in export_orders or table not found");
  }
  
  const { data: data2 } = await supabase.from('export_shipments').select('*').limit(1);
  if (data2 && data2.length > 0) {
    console.log("export_shipments columns:", Object.keys(data2[0]));
  }
}

check();
