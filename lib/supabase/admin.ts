import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL atau Service Role Key belum dikonfigurasi di file .env');
  }

  if (
    serviceRoleKey.startsWith('sb_publishable_') ||
    serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY di .env.local masih menggunakan Publishable Key. Harap gunakan Service Role Secret Key dari Supabase Dashboard (Project Settings -> API -> service_role secret).'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
