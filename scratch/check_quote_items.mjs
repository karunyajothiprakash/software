import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sxebygxpjzntogzpjnga.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  console.log("--- Checking quotation_items ---");
  const { data, error } = await supabase.from('quotation_items').select('*').limit(1);
  if (error) {
    console.error("Error fetching quotation_items:", error.message);
  } else if (data && data.length > 0) {
    console.log("quotation_items columns:", Object.keys(data[0]));
  } else {
    console.log("No data in quotation_items");
  }
}

check();
