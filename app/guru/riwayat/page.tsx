import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default async function RiwayatGuruPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let attendances: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', user.id)
      .order('tanggal', { ascending: false })
      .limit(30);
    attendances = data || [];
  }

  // Ringkasan
  const totalTepatWaktu = attendances.filter((a) => a.status_masuk === 'TEPAT_WAKTU').length;
  const totalTerlambat = attendances.filter((a) => a.status_masuk === 'TERLAMBAT').length;
  const totalIzinSakit = attendances.filter(
    (a) => a.status === 'IZIN' || a.status === 'SAKIT'
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Riwayat Kehadiran</h2>
        <p className="text-[11px] text-slate-500">Catatan presensi harian 30 hari terakhir</p>
      </div>

      {/* Mini Statistik */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Tepat Waktu</span>
          <span className="text-base font-semibold font-mono text-emerald-700">
            {totalTepatWaktu}
          </span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Terlambat</span>
          <span className="text-base font-semibold font-mono text-amber-600">{totalTerlambat}</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Izin/Sakit</span>
          <span className="text-base font-semibold font-mono text-slate-700">{totalIzinSakit}</span>
        </div>
      </div>

      {/* Daftar Log */}
      <div className="space-y-2">
        {attendances.length === 0 ? (
          <div className="py-8 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Belum ada catatan presensi.
          </div>
        ) : (
          attendances.map((att) => {
            const isTerlambat = att.status_masuk === 'TERLAMBAT';

            return (
              <div
                key={att.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(att.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isTerlambat
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isTerlambat ? 'Terlambat' : 'Tepat Waktu'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Masuk</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {att.jam_masuk
                          ? new Date(att.jam_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </span>
                    </div>
                    {att.foto_masuk_url && (
                      <a
                        href={att.foto_masuk_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded overflow-hidden border border-slate-200 block shrink-0"
                      >
                        <img
                          src={att.foto_masuk_url}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pulang</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {att.jam_pulang
                          ? new Date(att.jam_pulang).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </span>
                    </div>
                    {att.foto_pulang_url && (
                      <a
                        href={att.foto_pulang_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded overflow-hidden border border-slate-200 block shrink-0"
                      >
                        <img
                          src={att.foto_pulang_url}
                          alt="Selfie Pulang"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
