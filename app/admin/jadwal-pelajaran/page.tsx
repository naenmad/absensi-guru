import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ScheduleManagerClient from '@/components/admin/ScheduleManagerClient';

export default async function JadwalPelajaranPage() {
  const supabase = await createClient();

  const [schedulesRes, teachersRes, roomsRes, subjectsRes] = await Promise.all([
    supabase
      .from('schedules')
      .select('*, profiles(nama, nip, jabatan), rooms(nama_ruangan, gedung, kode_qr), subjects(nama_mapel, kode_mapel)')
      .order('jam_mulai', { ascending: true }),
    supabase.from('profiles').select('*').eq('role', 'GURU').order('nama', { ascending: true }),
    supabase.from('rooms').select('*').order('nama_ruangan', { ascending: true }),
    supabase.from('subjects').select('*').order('nama_mapel', { ascending: true }),
  ]);

  return (
    <ScheduleManagerClient
      initialSchedules={schedulesRes.data || []}
      teachers={teachersRes.data || []}
      rooms={roomsRes.data || []}
      subjects={subjectsRes.data || []}
    />
  );
}
