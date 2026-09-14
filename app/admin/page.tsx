import React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  TrendingUp,
  MapPin,
  Camera,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Ambil data guru
  const { data: allTeachers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'GURU')
    .order('nama', { ascending: true });

  const teachersList = allTeachers || [];
  const totalGuru = teachersList.length;

  // 2. Ambil data presensi hari ini
  const { data: todayAttendances } = await supabase
    .from('attendances')
    .select('*, profiles(nama, nip, jabatan)')
    .eq('tanggal', todayStr);

  const attendancesList = todayAttendances || [];

  // 3. Ambil data izin hari ini
  const { data: todayLeaves } = await supabase
    .from('leave_requests')
    .select('*, profiles(nama)')
    .eq('status', 'APPROVED')
    .lte('tgl_mulai', todayStr)
    .gte('tgl_selesai', todayStr);

  const leavesList = todayLeaves || [];

  // Perhitungan statistik
  const totalHadir = attendancesList.filter((a) => a.jam_masuk).length;
  const tepatWaktu = attendancesList.filter((a) => a.status_masuk === 'TEPAT_WAKTU').length;
  const terlambat = attendancesList.filter((a) => a.status_masuk === 'TERLAMBAT').length;
  const totalIzin = leavesList.length;
  const belumAbsen = Math.max(0, totalGuru - totalHadir - totalIzin);

  const persentaseHadir = totalGuru > 0 ? Math.round((totalHadir / totalGuru) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/10 flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
            Monitoring Presensi Real-Time
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            Ringkasan Kehadiran Hari Ini
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Pantau kehadiran dewan guru dan tenaga kependidikan secara langsung beserta bukti
            geolokasi dan swafoto.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
          <div className="text-right">
            <span className="text-xs text-blue-200 block">Tingkat Kehadiran</span>
            <span className="text-3xl font-black">{persentaseHadir}%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Grid Kartu Metrik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Guru</span>
            <span className="text-2xl font-bold text-slate-800">{totalGuru}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Tepat Waktu</span>
            <span className="text-2xl font-bold text-emerald-600">{tepatWaktu}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Terlambat</span>
            <span className="text-2xl font-bold text-amber-600">{terlambat}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Izin / Sakit</span>
            <span className="text-2xl font-bold text-indigo-600">{totalIzin}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Belum Hadir</span>
            <span className="text-2xl font-bold text-rose-600">{belumAbsen}</span>
          </div>
        </div>
      </div>

      {/* Tabel Log Presensi Hari Ini */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Kehadiran Hari Ini</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log aktivitas presensi masuk & pulang guru secara berurutan
            </p>
          </div>
          <Link
            href="/admin/laporan"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition"
          >
            Lihat Laporan Lengkap &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Guru</th>
                <th className="py-3.5 px-6">Foto Swafoto</th>
                <th className="py-3.5 px-6">Jam Masuk</th>
                <th className="py-3.5 px-6">Jam Pulang</th>
                <th className="py-3.5 px-6">Status Masuk</th>
                <th className="py-3.5 px-6">Koordinat GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendancesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada guru yang melakukan presensi hari ini.
                  </td>
                </tr>
              ) : (
                attendancesList.map((att) => {
                  const teacher = (att.profiles as any) || {};
                  const isTerlambat = att.status_masuk === 'TERLAMBAT';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{teacher.nama || 'Guru'}</div>
                        <div className="text-[11px] text-slate-400">
                          {teacher.nip ? `NIP. ${teacher.nip}` : teacher.jabatan || '-'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {att.foto_masuk_url ? (
                            <a
                              href={att.foto_masuk_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 block shadow-sm"
                            >
                              <img
                                src={att.foto_masuk_url}
                                alt="Selfie Masuk"
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Camera className="w-4 h-4" />
                            </div>
                          )}
                          {att.foto_pulang_url && (
                            <a
                              href={att.foto_pulang_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 block shadow-sm"
                            >
                              <img
                                src={att.foto_pulang_url}
                                alt="Selfie Pulang"
                                className="w-full h-full object-cover"
                              />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {att.jam_masuk
                          ? new Date(att.jam_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {att.jam_pulang
                          ? new Date(att.jam_pulang).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                            isTerlambat
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isTerlambat ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {att.lat_masuk && att.lng_masuk ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              {att.lat_masuk.toFixed(4)}, {att.lng_masuk.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
