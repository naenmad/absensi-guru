import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminStatistikClient from '@/components/admin/AdminStatistikClient';

export const dynamic = 'force-dynamic';

export default async function AdminStatistikPage() {
  const supabase = await createClient();

  const [teachersRes, attendancesRes, settingsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'GURU')
      .order('nama', { ascending: true }),
    supabase
      .from('attendances')
      .select('*')
      .order('tanggal', { ascending: false }),
    supabase.from('school_settings').select('nama_sekolah').limit(1).maybeSingle(),
  ]);

  return (
    <AdminStatistikClient
      teachers={teachersRes.data || []}
      attendances={attendancesRes.data || []}
      schoolName={settingsRes.data?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
    />
  );
}
