import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StatistikClient from '@/components/guru/StatistikClient';

export const dynamic = 'force-dynamic';

export default async function GuruStatistikPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [attRes, leaveRes, settingsRes] = await Promise.all([
    supabase
      .from('attendances')
      .select('*')
      .eq('user_id', user.id)
      .order('tanggal', { ascending: false }),
    supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('school_settings').select('*').limit(1).maybeSingle(),
  ]);

  return (
    <StatistikClient
      attendances={attRes.data || []}
      leaves={leaveRes.data || []}
      schoolSettings={settingsRes.data}
    />
  );
}
