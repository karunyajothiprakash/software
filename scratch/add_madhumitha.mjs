import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ override: true });

const env = dotenv.parse(readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-00000000ae01';

async function addMadhumitha() {
  console.log("Adding Madhumitha as secretary (Biometric ID: 1010)...");
  
  const email = 'madhumitha@shastikaglobal.com';
  const password = Math.random().toString(36).slice(-12) + 'A1!'; // strong random password
  
  // 1. Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Madhumitha',
      company_id: SHARED_COMPANY_ID
    }
  });

  if (authErr) {
    console.error("❌ Failed to create auth user:", authErr.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created successfully. ID: ${userId}`);

  // The database trigger 'handle_new_user' might have run.
  // Let's wait 1 second for database triggers to finish.
  await new Promise(r => setTimeout(r, 1000));

  // 2. Update the profile
  const { error: profErr } = await supabase
    .from('profiles')
    .update({
      full_name: 'Madhumitha',
      biometric_id: '1010',
      requested_role: 'secretary',
      status: 'approved',
      company_id: SHARED_COMPANY_ID,
      is_active: true
    })
    .eq('id', userId);

  if (profErr) {
    console.error("❌ Failed to update profile:", profErr.message);
    return;
  }
  console.log("✅ Profile updated successfully with Biometric ID 1010.");

  // 3. Find role 'secretary' for the company
  const { data: roleData, error: roleErr } = await supabase
    .from('roles')
    .select('id')
    .eq('company_id', SHARED_COMPANY_ID)
    .eq('slug', 'secretary')
    .maybeSingle();

  if (roleErr) {
    console.error("❌ Failed to fetch roles:", roleErr.message);
    return;
  }

  let roleId = roleData?.id;

  if (!roleId) {
    // If secretary role doesn't exist, create it
    console.log("Secretary role not found, creating it...");
    const { data: newRole, error: createRoleErr } = await supabase
      .from('roles')
      .insert({
        company_id: SHARED_COMPANY_ID,
        name: 'Secretary',
        slug: 'secretary',
        description: 'Office secretary role'
      })
      .select('id')
      .single();

    if (createRoleErr) {
      console.error("❌ Failed to create secretary role:", createRoleErr.message);
      return;
    }
    roleId = newRole.id;
    console.log(`✅ Created Secretary role with ID: ${roleId}`);
  }

  // 4. Assign the role in user_roles
  // Delete existing roles for this user first to be clean
  await supabase.from('user_roles').delete().eq('user_id', userId);

  const { error: assignErr } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId
    });

  if (assignErr) {
    console.error("❌ Failed to assign role in user_roles:", assignErr.message);
    return;
  }
  console.log("✅ Role 'secretary' assigned successfully.");
  console.log("\n🎉 Madhumitha (1010) successfully created!");
}

addMadhumitha();
