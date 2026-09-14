import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, QrCode, BookOpen } from 'lucide-react';
import LiveClock from '@/components/guru/LiveClock';

export default async function GuruDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = new Date().toISOString().split('T')[0];

  // Dapatkan nama hari ini dalam Bahasa Indonesia
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = days[new Date().getDay()];

  let todayAttendance = null;
  let settings = null;
  let todaySchedules: any[] = [];
  let todayClassAttendances: any[] = [];

  if (user) {
    const [attRes, setRes, schRes, clsAttRes] = await Promise.all([
      supabase.from('attendances').select('*').eq('user_id', user.id).eq('tanggal', todayStr).maybeSingle(),
      supabase.from('school_settings').select('*').limit(1).maybeSingle(),
      supabase
        .from('teaching_schedules')
        .select('*, classes(nama_kelas), subjects(nama_mapel)')
        .eq('teacher_id', user.id)
        .eq('hari', todayDayName)
        .order('jam_mulai', { ascending: true }),
      supabase
        .from('class_attendances')
        .select('*, classes(nama_kelas)')
        .eq('teacher_id', user.id)
        .eq('tanggal', todayStr),
    ]);

    todayAttendance = attRes.data;
    settings = setRes.data;
    todaySchedules = schRes.data || [];
    todayClassAttendances = clsAttRes.data || [];
  }

  const sudahMasuk = !!todayAttendance?.jam_masuk;
  const sudahPulang = !!todayAttendance?.jam_pulang;

  return (
    <div className="space-y-5">
      {/* Kartu Jam Digital & Tanggal */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <LiveClock />

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-200" />
              {settings?.nama_sekolah || 'Sekolah'}
            </span>
            <span>Radius: {settings?.radius_meters || 100}m</span>
          </div>
        </div>
      </div>

      {/* Status Kehadiran Hari Ini */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Status Hari Ini</h3>
          {sudahMasuk ? (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                todayAttendance.status_masuk === 'TERLAMBAT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {todayAttendance.status_masuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Belum Presensi
            </span>
          )}
        </div>

        {/* Grid Masuk & Pulang */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Presensi Masuk</span>
            <span className="text-lg font-bold text-slate-800">
              {todayAttendance?.jam_masuk
                ? new Date(todayAttendance.jam_masuk).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Jadwal: {settings?.jam_masuk ? settings.jam_masuk.slice(0, 5) : '07:00'} WIB
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Presensi Pulang</span>
            <span className="text-lg font-bold text-slate-800">
              {todayAttendance?.jam_pulang
                ? new Date(todayAttendance.jam_pulang).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Jadwal: {settings?.jam_pulang ? settings.jam_pulang.slice(0, 5) : '15:00'} WIB
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Cepat Presensi */}
      <div className="space-y-3">
        {!sudahMasuk ? (
          <Link
            href="/guru/presensi?type=MASUK"
            className="w-full py-4 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-between font-semibold transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-sm">Presensi Masuk Sekarang</span>
                <span className="text-xs text-blue-100 font-normal">GPS & Verifikasi Wajah</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : !sudahPulang ? (
          <Link
            href="/guru/presensi?type=PULANG"
            className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-between font-semibold transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-sm">Presensi Pulang</span>
                <span className="text-xs text-emerald-100 font-normal">Selesai Jam Kerja</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Presensi hari ini telah lengkap. Terima kasih atas dedikasi Anda!</span>
          </div>
        )}

        {/* Tombol Ajukan Izin */}
        <Link
          href="/guru/izin"
          className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition"
        >
          <span>Tidak bisa hadir? Ajukan Izin / Sakit</span>
        </Link>
      </div>

      {/* SEKSI JADWAL MENGAJAR & SCAN QR KELAS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Jadwal Mengajar ({todayDayName})</h3>
              <p className="text-[11px] text-slate-400">Daftar kelas yang Anda ampu hari ini</p>
            </div>
          </div>

          <Link
            href="/guru/scan-kelas"
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Kelas</span>
          </Link>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
            Tidak ada jadwal mengajar di kelas untuk hari {todayDayName}.
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaySchedules.map((sch) => {
              const klsName = sch.classes?.nama_kelas || 'Kelas';
              const mapelName = sch.subjects?.nama_mapel || 'Mapel';
              const hasCheckedIn = todayClassAttendances.some((a) => a.class_id === sch.class_id);

              return (
                <div
                  key={sch.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800">{mapelName}</div>
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {klsName}
                      </span>
                      <span>
                        {sch.jam_mulai?.slice(0, 5)} - {sch.jam_selesai?.slice(0, 5)} WIB
                      </span>
                    </div>
                  </div>

                  {hasCheckedIn ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                    </span>
                  ) : (
                    <Link
                      href="/guru/scan-kelas"
                      className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-full text-[10px] flex items-center gap-1 transition"
                    >
                      <QrCode className="w-3 h-3" /> Check-in QR
                    </Link>
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
