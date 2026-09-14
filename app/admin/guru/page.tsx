import React from 'react';
import { createClient } from '@/lib/supabase/server';
import TeacherManagerClient from '@/components/admin/TeacherManagerClient';

export default async function GuruAdminPage() {
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'GURU')
    .order('created_at', { ascending: false });

  return <TeacherManagerClient initialTeachers={teachers || []} />;
}
