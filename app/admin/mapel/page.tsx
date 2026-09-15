import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SubjectManagerClient from '@/components/admin/SubjectManagerClient';

export default async function MapelPage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('nama_mapel', { ascending: true });

  return <SubjectManagerClient initialSubjects={subjects || []} />;
}
