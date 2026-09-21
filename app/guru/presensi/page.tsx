import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getWIBDateString } from '@/lib/date';
import PresensiClient from '@/components/guru/PresensiClient';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PresensiPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function PresensiPage({ searchParams }: PresensiPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { type } = (await searchParams) || {};
  const forcedType = type === 'MASUK' || type === 'PULANG' ? type : undefined;

  const todayStr = getWIBDateString(new Date());

  // Ambil presensi hari ini, pengaturan sekolah, dan permohonan izin aktif
  const [attRes, setRes, leaveRes] = await Promise.all([
    supabase
      .from('attendances')
      .select('*')
      .eq('user_id', user.id)
      .eq('tanggal', todayStr)
      .maybeSingle(),
    supabase.from('school_settings').select('*').limit(1).maybeSingle(),
    supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'APPROVED')
      .lte('tgl_mulai', todayStr)
      .gte('tgl_selesai', todayStr)
      .maybeSingle(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-slate-600 mb-2" />
          <span>Memuat modul presensi...</span>
        </div>
      }
    >
      <PresensiClient
        todayAttendance={attRes.data}
        settings={setRes.data}
        activeLeave={leaveRes.data}
        forcedType={forcedType}
      />
    </Suspense>
  );
}
