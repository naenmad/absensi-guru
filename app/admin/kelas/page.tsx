import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ClassSubjectManagerClient from '@/components/admin/ClassSubjectManagerClient';

export default async function KelasAdminPage() {
  const supabase = await createClient();

  const [classesRes, subjectsRes, settingsRes] = await Promise.all([
    supabase.from('classes').select('*').order('nama_kelas', { ascending: true }),
    supabase.from('subjects').select('*').order('nama_mapel', { ascending: true }),
    supabase.from('school_settings').select('nama_sekolah').limit(1).maybeSingle(),
  ]);

  return (
    <ClassSubjectManagerClient
      initialClasses={classesRes.data || []}
      initialSubjects={subjectsRes.data || []}
      schoolName={settingsRes.data?.nama_sekolah || 'SMK Negeri 1 Teladan'}
    />
  );
}
