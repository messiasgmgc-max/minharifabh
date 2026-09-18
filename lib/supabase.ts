import { createClient } from '@supabase/supabase-js';
import { getSetting } from './settings';

export async function getSupabaseClient() {
  const url = await getSetting('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const serviceKey = await getSetting('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}
