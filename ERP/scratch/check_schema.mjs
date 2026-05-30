import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sxebygxpjzntogzpjnga.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  console.log("--- Checking export_orders ---");
  const { data: orderData, error: orderErr } = await supabase.from('export_orders').select('*').limit(1);
  if (orderErr) {
    console.error("Error fetching export_orders:", orderErr.message);
  } else if (orderData && orderData.length > 0) {
    console.log("export_orders columns:", Object.keys(orderData[0]));
  } else {
    console.log("No data in export_orders");
  }

  console.log("\n--- Checking quotations ---");
  const { data: quoteData, error: quoteErr } = await supabase.from('quotations').select('*').limit(1);
  if (quoteErr) {
    console.error("Error fetching quotations:", quoteErr.message);
  } else if (quoteData && quoteData.length > 0) {
    console.log("quotations columns:", Object.keys(quoteData[0]));
  } else {
    console.log("No data in quotations");
  }
}

check();
