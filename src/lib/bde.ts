
import { createClient } from '@supabase/supabase-js';

export async function fetchBdeProfiles(supabase: any) {
  try {
    // 1. Get the BDE role ID specifically
    const { data: bdeRole } = await supabase
      .from('roles')
      .select('id, slug, name')
      .or('slug.ilike.bde,name.ilike.bde')
      .single();

    if (!bdeRole) {
      console.error("BDE role not found in roles table");
      return [];
    }

    // 2. Get all user IDs assigned this role
    const { data: userRoles, error: urError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', bdeRole.id);

    if (urError) throw urError;

    const userIds = userRoles?.map((ur: any) => ur.user_id) || [];
    if (userIds.length === 0) return [];

    // 3. Get profile details for these users
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, email, requested_role')
      .in('id', userIds);

    if (pError) throw pError;

    return profiles || [];
  } catch (error) {
    console.error("Error in fetchBdeProfiles:", error);
    return [];
  }
}
