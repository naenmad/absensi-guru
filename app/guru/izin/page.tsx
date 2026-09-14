import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { submitLeaveAction } from '@/actions/izin';
import { FileText, Send, Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import FormIzinClient from '@/components/guru/FormIzinClient';

export default async function IzinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myLeaves: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    myLeaves = data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Permohonan Izin / Cuti</h2>
        <p className="text-xs text-slate-500">
          Ajukan permohonan ketidakhadiran resmi kepada pihak sekolah
        </p>
      </div>

      {/* Form Pengajuan Izin */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <FormIzinClient />
      </div>

      {/* Riwayat Pengajuan Izin */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm">Riwayat Pengajuan Anda</h3>

        {myLeaves.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Belum ada riwayat permohonan izin.
          </div>
        ) : (
          <div className="space-y-2.5">
            {myLeaves.map((leave) => {
              const badgeStyle =
                leave.status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : leave.status === 'REJECTED'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              const statusText =
                leave.status === 'APPROVED'
                  ? 'Disetujui'
                  : leave.status === 'REJECTED'
                  ? 'Ditolak'
                  : 'Menunggu Review';

              return (
                <div
                  key={leave.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700">
                      {leave.jenis}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badgeStyle}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{leave.alasan}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {leave.tgl_mulai} s/d {leave.tgl_selesai}
                    </span>
                    {leave.bukti_url && (
                      <a
                        href={leave.bukti_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Lihat Bukti
                      </a>
                    )}
                  </div>

                  {leave.catatan_admin && (
                    <div className="text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 mt-1">
                      <b>Catatan Admin:</b> {leave.catatan_admin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
