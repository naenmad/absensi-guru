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
  const totalHadir = attendances.filter((a) => a.status === 'HADIR').length;
  const totalTerlambat = attendances.filter((a) => a.status_masuk === 'TERLAMBAT').length;
  const totalIzinSakit = attendances.filter(
    (a) => a.status === 'IZIN' || a.status === 'SAKIT'
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Riwayat Kehadiran</h2>
        <p className="text-xs text-slate-500">Catatan presensi harian 30 hari terakhir</p>
      </div>

      {/* Mini Statistik */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Tepat Waktu</span>
          <span className="text-lg font-extrabold text-emerald-600">
            {totalHadir - totalTerlambat}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Terlambat</span>
          <span className="text-lg font-extrabold text-amber-500">{totalTerlambat}</span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Izin/Sakit</span>
          <span className="text-lg font-extrabold text-blue-600">{totalIzinSakit}</span>
        </div>
      </div>

      {/* Daftar Log */}
      <div className="space-y-2.5">
        {attendances.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Belum ada catatan presensi.
          </div>
        ) : (
          attendances.map((att) => {
            const isTerlambat = att.status_masuk === 'TERLAMBAT';

            return (
              <div
                key={att.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isTerlambat
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isTerlambat ? 'Terlambat' : 'Tepat Waktu'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Masuk</span>
                      <span className="font-semibold text-slate-800">
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
                        className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 block shrink-0"
                      >
                        <img
                          src={att.foto_masuk_url}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pulang</span>
                      <span className="font-semibold text-slate-800">
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
                        className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 block shrink-0"
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
