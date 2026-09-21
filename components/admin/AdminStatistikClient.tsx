'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  ChevronDown,
  User,
  ArrowUpRight,
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  email: string;
  no_hp: string | null;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  tanggal: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  status_masuk: 'TEPAT_WAKTU' | 'TERLAMBAT' | null;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPHA';
}

interface AdminStatistikClientProps {
  teachers: TeacherProfile[];
  attendances: AttendanceRecord[];
  schoolName: string;
}

export default function AdminStatistikClient({
  teachers,
  attendances,
  schoolName,
}: AdminStatistikClientProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

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

  // Filter presensi sesuai periode
  const filteredAttendances = attendances.filter((att) => {
    const d = new Date(att.tanggal);
    const matchYear = d.getFullYear() === selectedYear;
    const matchMonth = selectedMonth === 0 ? true : d.getMonth() + 1 === selectedMonth;
    return matchYear && matchMonth;
  });

  // Agregasi performa per guru
  const teacherStats = teachers.map((teacher) => {
    const teacherLogs = filteredAttendances.filter((a) => a.user_id === teacher.id);
    const tepatWaktu = teacherLogs.filter((a) => a.status_masuk === 'TEPAT_WAKTU').length;
    const terlambat = teacherLogs.filter((a) => a.status_masuk === 'TERLAMBAT').length;
    const hadir = tepatWaktu + terlambat;
    const izin = teacherLogs.filter((a) => a.status === 'IZIN').length;
    const sakit = teacherLogs.filter((a) => a.status === 'SAKIT').length;

    const rateTepatWaktu = hadir > 0 ? Math.round((tepatWaktu / hadir) * 100) : 100;

    return {
      teacher,
      hadir,
      tepatWaktu,
      terlambat,
      izin,
      sakit,
      rateTepatWaktu,
      logs: teacherLogs,
    };
  });

  // Filter pencarian
  const displayedStats = teacherStats.filter(({ teacher }) => {
    const query = searchQuery.toLowerCase();
    return (
      teacher.nama.toLowerCase().includes(query) ||
      (teacher.nip && teacher.nip.includes(query)) ||
      (teacher.jabatan && teacher.jabatan.toLowerCase().includes(query))
    );
  });

  // Agregasi Global Sekolah
  const totalGuru = teachers.length;
  const totalHadirGlobal = teacherStats.reduce((acc, s) => acc + s.hadir, 0);
  const totalTepatWaktuGlobal = teacherStats.reduce((acc, s) => acc + s.tepatWaktu, 0);
  const totalTerlambatGlobal = teacherStats.reduce((acc, s) => acc + s.terlambat, 0);
  const totalIzinGlobal = teacherStats.reduce((acc, s) => acc + s.izin + s.sakit, 0);
  const rataRataDisiplinSekolah =
    totalHadirGlobal > 0 ? Math.round((totalTepatWaktuGlobal / totalHadirGlobal) * 100) : 100;

  // Guru terpilih untuk modal detail
  const selectedTeacherStat = teacherStats.find((s) => s.teacher.id === selectedTeacherId);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Statistik & Kinerja Guru
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap performa kehadiran, disiplin waktu, dan izin seluruh tenaga pendidik {schoolName}
          </p>
        </div>

        {/* Filter Periode */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 shadow-xs"
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

      {/* KPI Cards Ringkasan Seluruh Sekolah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Guru</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalGuru}</div>
          <span className="text-[11px] text-slate-400 block">Pendidik aktif</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Disiplin Sekolah</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {rataRataDisiplinSekolah}%
          </div>
          <span className="text-[11px] text-slate-400 block">Rata-rata tepat waktu</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tepat Waktu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {totalTepatWaktuGlobal}
          </div>
          <span className="text-[11px] text-slate-400 block">Presensi masuk tepat</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Terlambat</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {totalTerlambatGlobal}
          </div>
          <span className="text-[11px] text-slate-400 block">Melewati batas waktu</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Izin & Sakit</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700">{totalIzinGlobal}</div>
          <span className="text-[11px] text-slate-400 block">Hari izin resmi</span>
        </div>
      </div>

      {/* Pencarian & Tabel Performa Seluruh Guru */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Tabel Rekap Kehadiran Guru ({displayedStats.length} Guru)
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari guru atau NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 border-y border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Guru</th>
                <th className="px-3 py-3 text-center">Kehadiran</th>
                <th className="px-3 py-3 text-center">Tepat Waktu</th>
                <th className="px-3 py-3 text-center">Terlambat</th>
                <th className="px-3 py-3 text-center">Izin / Sakit</th>
                <th className="px-3 py-3 text-center">Disiplin</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Tidak ditemukan data guru.
                  </td>
                </tr>
              ) : (
                displayedStats.map((item) => (
                  <tr key={item.teacher.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{item.teacher.nama}</div>
                      <div className="text-[11px] text-slate-400 font-mono font-normal">
                        {item.teacher.nip ? `NIP. ${item.teacher.nip}` : item.teacher.jabatan || 'Guru'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-900">
                      {item.hadir}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-emerald-700">
                      {item.tepatWaktu}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-amber-600">
                      {item.terlambat}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-blue-700">
                      {item.izin + item.sakit}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.rateTepatWaktu >= 90
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.rateTepatWaktu >= 75
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.rateTepatWaktu}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedTeacherId(item.teacher.id)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-medium transition cursor-pointer"
                      >
                        Rincian
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rincian Guru Terpilih */}
      {selectedTeacherStat && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Kehadiran: {selectedTeacherStat.teacher.nama}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Periode:{' '}
                  {selectedMonth === 0
                    ? `Tahun ${selectedYear}`
                    : `${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacherId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrik Mini */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Total Hadir</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedTeacherStat.hadir}
                </span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-600 block">Tepat Waktu</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {selectedTeacherStat.tepatWaktu}
                </span>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-[10px] text-amber-600 block">Terlambat</span>
                <span className="text-base font-bold text-amber-800 font-mono">
                  {selectedTeacherStat.terlambat}
                </span>
              </div>
            </div>

            {/* List Catatan Harian */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {selectedTeacherStat.logs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada catatan presensi pada periode ini.
                </div>
              ) : (
                selectedTeacherStat.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {new Date(log.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        M: {log.jam_masuk ? new Date(log.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} •{' '}
                        P: {log.jam_pulang ? new Date(log.jam_pulang).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        log.status_masuk === 'TERLAMBAT'
                          ? 'bg-amber-100 text-amber-800'
                          : log.status === 'IZIN' || log.status === 'SAKIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.status === 'IZIN' || log.status === 'SAKIT'
                        ? log.status
                        : log.status_masuk === 'TERLAMBAT'
                        ? 'Terlambat'
                        : 'Tepat Waktu'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedTeacherId(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
