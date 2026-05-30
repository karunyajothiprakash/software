import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ override: true });

const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const USER_ID_TO_DELETE = 'f85f3f8f-61bd-4b9b-adbf-ca2c1f7699b4'; // karunyajothiprakash811@gmail.com

async function deleteUser() {
  console.log(`Attempting to delete user ${USER_ID_TO_DELETE} (karunyajothiprakash811@gmail.com)...`);
  
  const { error } = await supabase.auth.admin.deleteUser(USER_ID_TO_DELETE);
  
  if (error) {
    console.error("❌ Failed to delete user:", error.message);
  } else {
    console.log("✅ User deleted successfully from auth.users (profile and roles deleted via cascade).");
  }
}

deleteUser();
