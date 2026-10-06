import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let profile = null;
  let settings = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    }

    const { data: set } = await supabase.from('school_settings').select('*').limit(1).maybeSingle();
    settings = set;
  } catch (e) {
    console.error('Error fetching admin layout data:', e);
  }

  return (
    <AdminLayoutClient profile={profile} settings={settings}>
      {children}
    </AdminLayoutClient>
  );
}
