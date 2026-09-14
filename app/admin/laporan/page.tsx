import React from 'react';
import { createClient } from '@/lib/supabase/server';
import LaporanClient from '@/components/admin/LaporanClient';

export default async function LaporanAdminPage() {
  const supabase = await createClient();

  const { data: attendances } = await supabase
    .from('attendances')
    .select('*, profiles(nama, nip, jabatan)')
    .order('tanggal', { ascending: false });

  return <LaporanClient initialAttendances={attendances || []} />;
}
