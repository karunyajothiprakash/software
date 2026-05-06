import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://sxebygxpjzntogzpjnga.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWJ5Z3hwanpudG9nenBqbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjc5MzksImV4cCI6MjA5MjkwMzkzOX0.rtClmtuPuNicVQvBkITzY6PfFsh8yOYq3ykWoL9Ab_4"
);

async function check() {
  const { count: shipmentCount } = await supabase.from('export_shipments').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase.from('export_orders').select('*', { count: 'exact', head: true });
  
  console.log('Shipments count:', shipmentCount);
  console.log('Orders count:', orderCount);
  
  const { data: shipments, error } = await supabase
    .from('export_shipments')
    .select('*, export_orders(*)')
    .limit(5);

  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Shipments sample:', JSON.stringify(shipments, null, 2));
  }
}

check();
