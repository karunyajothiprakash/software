import { createClient } from '@supabase/supabase-client'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('quotation_items').select('*').limit(1)
  if (error) {
    console.error('Error fetching quotation_items:', error)
  } else {
    console.log('Columns in quotation_items:', data && data[0] ? Object.keys(data[0]) : 'No data found')
  }
}

checkColumns()
