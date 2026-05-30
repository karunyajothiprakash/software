import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sxebygxpjzntogzpjnga.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'quotations' });
  // If rpc doesn't exist, we can't easily get types without a special query.
  // Let's try to just select one and check the values.
  const { data: quote, error: err } = await supabase.from('quotations').select('*').limit(1).single();
  if (err) {
      console.error(err);
      return;
  }
  console.log("Types of columns (inferred from first row):");
  for (const key in quote) {
      console.log(`${key}: ${typeof quote[key]}`);
  }
}

check();
