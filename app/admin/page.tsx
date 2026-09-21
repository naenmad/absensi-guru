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
    <div className="space-y-6">
      {/* Header Ringkasan & Tingkat Kehadiran */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ringkasan Kehadiran Hari Ini
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pemantauan presensi pendidik & tenaga kependidikan berbasis lokasi dan swafoto
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-lg border border-slate-200/80 self-start md:self-auto">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tingkat Kehadiran</span>
            <span className="text-2xl font-bold text-slate-900">{persentaseHadir}%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Grid Kartu Metrik */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Guru</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalGuru}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Akun terdaftar</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Tepat Waktu</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{tepatWaktu}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Sebelum batas waktu</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Terlambat</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{terlambat}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Melewati batas waktu</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Izin / Cuti</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{totalIzin}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Disetujui hari ini</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Belum Presensi</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">{belumAbsen}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Belum ada catatan</span>
        </div>
      </div>

      {/* Tabel Log Presensi Hari Ini */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Catatan Presensi Hari Ini</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log kehadiran masuk dan kepulangan guru
            </p>
          </div>
          <Link
            href="/admin/laporan"
            className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            Buka Rekapitulasi
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Guru</th>
                <th className="py-3 px-5">Swafoto</th>
                <th className="py-3 px-5">Jam Masuk</th>
                <th className="py-3 px-5">Jam Pulang</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Lokasi GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendancesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada presensi tercatat hari ini.
                  </td>
                </tr>
              ) : (
                attendancesList.map((att) => {
                  const teacher = (att.profiles as any) || {};
                  const isTerlambat = att.status_masuk === 'TERLAMBAT';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{teacher.nama || 'Guru'}</div>
                        <div className="text-[11px] text-slate-400">
                          {teacher.nip ? `NIP. ${teacher.nip}` : teacher.jabatan || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          {att.foto_masuk_url ? (
                            <a
                              href={att.foto_masuk_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 block"
                            >
                              <img
                                src={att.foto_masuk_url}
                                alt="Selfie Masuk"
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {att.foto_pulang_url && (
                            <a
                              href={att.foto_pulang_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 block"
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

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {att.jam_masuk
                          ? new Date(att.jam_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {att.jam_pulang
                          ? new Date(att.jam_pulang).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium text-[11px] border ${
                            isTerlambat
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isTerlambat ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        {att.lat_masuk && att.lng_masuk ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
