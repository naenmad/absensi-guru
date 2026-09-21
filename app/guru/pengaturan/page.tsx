import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PengaturanClient from '@/components/guru/PengaturanClient';

export const dynamic = 'force-dynamic';

export default async function GuruPengaturanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('school_settings').select('nama_sekolah').limit(1).maybeSingle(),
  ]);

  return (
    <PengaturanClient
      profile={profile}
      schoolName={settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
    />
  );
}
