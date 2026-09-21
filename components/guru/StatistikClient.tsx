'use client';

import React, { useState } from 'react';
import { formatTimeWIB } from '@/lib/date';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  PieChart,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  tanggal: string;
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  status_masuk?: 'TEPAT_WAKTU' | 'TERLAMBAT' | null;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPHA';
  catatan?: string | null;
  foto_masuk_url?: string | null;
  foto_pulang_url?: string | null;
}

interface LeaveRecord {
  id: string;
  jenis: string;
  tgl_mulai: string;
  tgl_selesai: string;
  alasan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface StatistikClientProps {
  attendances: AttendanceRecord[];
  leaves: LeaveRecord[];
  schoolSettings: any;
}

export default function StatistikClient({
  attendances,
  leaves,
  schoolSettings,
}: StatistikClientProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // 0 = Semua Bulan

  const months = [
    { value: 0, label: 'Semua Bulan (1 Tahun)' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  // Filter presensi berdasarkan bulan & tahun
  const filteredAttendances = attendances.filter((att) => {
    const d = new Date(att.tanggal);
    const matchYear = d.getFullYear() === selectedYear;
    const matchMonth = selectedMonth === 0 ? true : d.getMonth() + 1 === selectedMonth;
    return matchYear && matchMonth;
  });

  // Filter izin berdasarkan tahun/bulan
  const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED');

  // Metrik Kehadiran
  const totalPresensi = filteredAttendances.length;
  const totalTepatWaktu = filteredAttendances.filter(
    (a) => a.status_masuk === 'TEPAT_WAKTU'
  ).length;
  const totalTerlambat = filteredAttendances.filter(
    (a) => a.status_masuk === 'TERLAMBAT'
  ).length;
  const totalIzin = filteredAttendances.filter((a) => a.status === 'IZIN').length;
  const totalSakit = filteredAttendances.filter((a) => a.status === 'SAKIT').length;
  const totalHadirFisik = totalTepatWaktu + totalTerlambat;

  // Tingkat Kedisiplinan / Ketepatan Waktu
  const persentaseTepatWaktu =
    totalHadirFisik > 0 ? Math.round((totalTepatWaktu / totalHadirFisik) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Header & Filter Periode */}
      <div className="space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Statistik Kehadiran Saya</h2>
          <p className="text-[11px] text-slate-500">
            Pantau rekapitulasi disiplin dan catatan presensi personal Anda
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 shadow-xs"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 shadow-xs"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kartu Sorotan Utama / Ringkasan KPI */}
      <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Tingkat Ketepatan Waktu</span>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            {persentaseTepatWaktu}% Disiplin
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Kehadiran Fisik</span>
            <span className="text-2xl font-bold font-mono text-white">{totalHadirFisik}</span>
            <span className="text-[10px] text-slate-400 block">hari kerja</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Izin & Sakit Disetujui</span>
            <span className="text-2xl font-bold font-mono text-sky-400">
              {totalIzin + totalSakit}
            </span>
            <span className="text-[10px] text-slate-400 block">hari resmi</span>
          </div>
        </div>
      </div>

      {/* Rincian 4 Statistik Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Tepat Waktu</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{totalTepatWaktu}</div>
          <span className="text-[10px] text-slate-400 block">Presensi sebelum batas jam masuk</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Terlambat</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600">{totalTerlambat}</div>
          <span className="text-[10px] text-slate-400 block">Presensi melewati toleransi</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Izin Resmi</span>
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">{totalIzin}</div>
          <span className="text-[10px] text-slate-400 block">Keperluan dinas/pribadi</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Sakit</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-700">{totalSakit}</div>
          <span className="text-[10px] text-slate-400 block">Surat dokter / bukti</span>
        </div>
      </div>

      {/* Riwayat Detail Log Presensi Periode Terpilih */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-semibold text-slate-900">
            Log Kehadiran ({filteredAttendances.length} Catatan)
          </h3>
        </div>

        {filteredAttendances.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Tidak ada catatan presensi pada periode yang dipilih.
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredAttendances.map((att) => {
              const isTerlambat = att.status_masuk === 'TERLAMBAT';
              const isLeave = att.status === 'IZIN' || att.status === 'SAKIT';

              return (
                <div
                  key={att.id}
                  className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">
                      {new Date(att.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    {isLeave ? (
                      <div className="text-[11px] text-blue-700 font-medium">
                        {att.status}: {att.catatan || 'Izin Resmi'}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>M: {att.jam_masuk ? formatTimeWIB(att.jam_masuk) : '-'}</span>
                        <span>•</span>
                        <span>P: {att.jam_pulang ? formatTimeWIB(att.jam_pulang) : '-'}</span>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isLeave
                        ? 'bg-blue-100 text-blue-800'
                        : isTerlambat
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLeave ? att.status : isTerlambat ? 'Terlambat' : 'Tepat Waktu'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
