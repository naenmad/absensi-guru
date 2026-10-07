import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let profile = null;
  let settings = null;

  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const roleOverride = cookieStore.get('auth_impersonate_role')?.value;
    const emailOverride = cookieStore.get('auth_impersonate_email')?.value;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (roleOverride === 'KEPSEK' || emailOverride === 'kepsek@smpn8karawangbarat.sch.id') {
        const { data: kepsekData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'kepsek@smpn8karawangbarat.sch.id')
          .maybeSingle();

        if (kepsekData) {
          profile = {
            ...kepsekData,
            role: 'KEPSEK' as const,
          };
        }
      }

      if (!profile) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          const isKepsek =
            data.jabatan?.toLowerCase().includes('kepala sekolah') ||
            data.email === 'kepsek@smpn8karawangbarat.sch.id';
          profile = {
            ...data,
            role: (isKepsek ? 'KEPSEK' : data.role) as any,
          };
        }
      }
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
