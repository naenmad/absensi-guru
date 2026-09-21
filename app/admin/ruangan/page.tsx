import React from 'react';
import { createClient } from '@/lib/supabase/server';
import RoomManagerClient from '@/components/admin/RoomManagerClient';

export default async function RuanganPage() {
  const supabase = await createClient();

  const [roomsRes, settingsRes] = await Promise.all([
    supabase.from('rooms').select('*').order('nama_ruangan', { ascending: true }),
    supabase.from('school_settings').select('nama_sekolah').limit(1).maybeSingle(),
  ]);

  return (
    <RoomManagerClient
      initialRooms={roomsRes.data || []}
      schoolName={settingsRes.data?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
    />
  );
}
