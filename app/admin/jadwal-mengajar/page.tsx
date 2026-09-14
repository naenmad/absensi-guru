import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ScheduleManagerClient from '@/components/admin/ScheduleManagerClient';

export default async function JadwalMengajarAdminPage() {
  const supabase = await createClient();

  const [schedulesRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
    supabase
      .from('teaching_schedules')
      .select('*, profiles(nama, nip, jabatan), classes(nama_kelas, tingkat), subjects(nama_mapel, kode_mapel)')
      .order('jam_mulai', { ascending: true }),
    supabase.from('profiles').select('*').eq('role', 'GURU').order('nama', { ascending: true }),
    supabase.from('classes').select('*').order('nama_kelas', { ascending: true }),
    supabase.from('subjects').select('*').order('nama_mapel', { ascending: true }),
  ]);

  return (
    <ScheduleManagerClient
      initialSchedules={schedulesRes.data || []}
      teachers={teachersRes.data || []}
      classes={classesRes.data || []}
      subjects={subjectsRes.data || []}
    />
  );
}
