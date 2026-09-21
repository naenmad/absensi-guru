import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, QrCode, BookOpen, FileText } from 'lucide-react';
import LiveClock from '@/components/guru/LiveClock';
import { getWIBDateString, getWIBDayName, formatTimeWIB } from '@/lib/date';

export default async function GuruDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = getWIBDateString(new Date());
  const todayDayName = getWIBDayName(new Date());

  let todayAttendance = null;
  let settings = null;
  let todaySchedules: any[] = [];
  let todayClassAttendances: any[] = [];
  let activeLeave = null;

  if (user) {
    const [attRes, setRes, schRes, roomAttRes, leaveRes] = await Promise.all([
      supabase.from('attendances').select('*').eq('user_id', user.id).eq('tanggal', todayStr).maybeSingle(),
      supabase.from('school_settings').select('*').limit(1).maybeSingle(),
      supabase
        .from('schedules')
        .select('*, rooms(nama_ruangan, gedung), subjects(nama_mapel)')
        .eq('teacher_id', user.id)
        .eq('hari', todayDayName)
        .order('jam_mulai', { ascending: true }),
      supabase
        .from('room_attendances')
        .select('*, rooms(nama_ruangan)')
        .eq('teacher_id', user.id)
        .eq('tanggal', todayStr),
      supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'APPROVED')
        .lte('tgl_mulai', todayStr)
        .gte('tgl_selesai', todayStr)
        .maybeSingle(),
    ]);

    todayAttendance = attRes.data;
    settings = setRes.data;
    todaySchedules = schRes.data || [];
    todayClassAttendances = roomAttRes.data || [];
    activeLeave = leaveRes.data;
  }

  const isIzinOrSakit =
    todayAttendance?.status === 'IZIN' ||
    todayAttendance?.status === 'SAKIT' ||
    !!activeLeave;
  const sudahMasuk = !!todayAttendance?.jam_masuk;
  const sudahPulang = !!todayAttendance?.jam_pulang;

  return (
    <div className="space-y-4">
      {/* Jam Digital & Tanggal (Solid Dark Enterprise Card) */}
      <div className="bg-slate-950 text-white rounded-xl p-5 border border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
            Radius {settings?.radius_meters || 100}m
          </span>
        </div>

        <LiveClock />

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
          </span>
          <span className="text-[11px] text-slate-400">
            Masuk: {settings?.jam_masuk?.slice(0, 5) || '07:00'} WIB
          </span>
        </div>
      </div>

      {/* Status Kehadiran Hari Ini */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900">Status Kehadiran</h3>
          {isIzinOrSakit ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> {todayAttendance?.status || activeLeave?.jenis || 'Izin Resmi'}
            </span>
          ) : sudahPulang ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Presensi Lengkap
            </span>
          ) : sudahMasuk ? (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                todayAttendance.status_masuk === 'TERLAMBAT'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {todayAttendance.status_masuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'}
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Belum Presensi
            </span>
          )}
        </div>

        {/* Grid Masuk & Pulang */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Presensi Masuk</span>
            <span className="text-base font-semibold text-slate-900 font-mono block">
              {todayAttendance?.jam_masuk ? formatTimeWIB(todayAttendance.jam_masuk) : '--:--'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Jadwal: {settings?.jam_masuk ? settings.jam_masuk.slice(0, 5) : '07:00'} WIB
            </span>
          </div>

          <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Presensi Pulang</span>
            <span className="text-base font-semibold text-slate-900 font-mono block">
              {todayAttendance?.jam_pulang ? formatTimeWIB(todayAttendance.jam_pulang) : '--:--'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Jadwal: {settings?.jam_pulang ? settings.jam_pulang.slice(0, 5) : '15:00'} WIB
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Cepat Presensi */}
      <div className="space-y-2.5">
        {isIzinOrSakit ? (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Anda tercatat izin resmi hari ini.</span>
            </div>
            <Link href="/guru/izin" className="text-blue-700 font-semibold hover:underline text-[11px]">
              Lihat Detail
            </Link>
          </div>
        ) : !sudahMasuk ? (
          <Link
            href="/guru/presensi?type=MASUK"
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs flex items-center justify-between font-medium transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold text-white">Presensi Masuk Sekarang</span>
                <span className="text-[11px] text-slate-400 font-normal">Validasi GPS & swafoto wajah</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        ) : !sudahPulang ? (
          <Link
            href="/guru/presensi?type=PULANG"
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs flex items-center justify-between font-medium transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold text-white">Presensi Pulang</span>
                <span className="text-[11px] text-emerald-100 font-normal">Selesai jam kerja sekolah</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-100" />
          </Link>
        ) : (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Presensi hari ini telah lengkap.</span>
            </div>
            <Link href="/guru/presensi" className="text-emerald-800 font-semibold hover:underline text-[11px]">
              Lihat Ringkasan
            </Link>
          </div>
        )}

        {/* Tombol Ajukan Izin (hanya jika belum izin) */}
        {!isIzinOrSakit && !sudahMasuk && (
          <Link
            href="/guru/izin"
            className="w-full py-2.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition shadow-xs"
          >
            <span>Tidak dapat hadir? Ajukan izin atau cuti</span>
          </Link>
        )}
      </div>

      {/* SEKSI JADWAL MENGAJAR & SCAN QR KELAS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Jadwal Mengajar ({todayDayName})</h3>
              <p className="text-[11px] text-slate-500">Kelas aktif hari ini</p>
            </div>
          </div>

          <Link
            href="/guru/scan-ruangan"
            className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </Link>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="py-6 px-4 bg-slate-50/60 rounded-lg text-center text-xs text-slate-400 border border-slate-100">
            Tidak ada jadwal mengajar di kelas untuk hari {todayDayName}.
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedules.map((sch) => {
              const roomName = sch.rooms?.nama_ruangan || 'Ruangan';
              const mapelName = sch.subjects?.nama_mapel || 'Mapel';
              const hasCheckedIn = todayClassAttendances.some((a) => a.room_id === sch.room_id);

              return (
                <div
                  key={sch.id}
                  className="p-3 bg-slate-50/60 border border-slate-200/70 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">{mapelName}</div>
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span className="font-medium text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {roomName}
                      </span>
                      <span className="font-mono text-[10px]">
                        {sch.jam_mulai?.slice(0, 5)} - {sch.jam_selesai?.slice(0, 5)} WIB
                      </span>
                    </div>
                  </div>

                  {hasCheckedIn ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium rounded-full text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                    </span>
                  ) : (
                    <Link
                      href="/guru/scan-ruangan"
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-[10px] flex items-center gap-1 transition shadow-xs"
                    >
                      <QrCode className="w-3 h-3" /> Check-in
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
