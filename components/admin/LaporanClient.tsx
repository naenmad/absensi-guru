'use client';

import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Camera,
} from 'lucide-react';

interface LaporanClientProps {
  initialAttendances: any[];
}

export default function LaporanClient({ initialAttendances }: LaporanClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter attendances
  const filteredData = initialAttendances.filter((att) => {
    const teacherName = att.profiles?.nama?.toLowerCase() || '';
    const nip = att.profiles?.nip?.toLowerCase() || '';
    const dateStr = att.tanggal || '';

    const matchesSearch =
      teacherName.includes(searchTerm.toLowerCase()) || nip.includes(searchTerm.toLowerCase());
    const matchesMonth = dateStr.startsWith(filterMonth);

    return matchesSearch && matchesMonth;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'Nama Guru',
      'NIP',
      'Jabatan',
      'Jam Masuk',
      'Status Masuk',
      'Jam Pulang',
      'Status Kehadiran',
      'Catatan',
    ];

    const rows = filteredData.map((a) => [
      a.tanggal,
      `"${a.profiles?.nama || ''}"`,
      `"${a.profiles?.nip || ''}"`,
      `"${a.profiles?.jabatan || ''}"`,
      a.jam_masuk ? new Date(a.jam_masuk).toLocaleTimeString('id-ID') : '',
      a.status_masuk || '',
      a.jam_pulang ? new Date(a.jam_pulang).toLocaleTimeString('id-ID') : '',
      a.status,
      `"${a.catatan || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_presensi_${filterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rekapitulasi Presensi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan riwayat kehadiran guru dan ekspor berkas data
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama guru atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-full sm:w-auto font-mono"
          />
        </div>
      </div>

      {/* Tabel Data Rekap */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Tanggal</th>
                <th className="py-3 px-5">Nama Guru</th>
                <th className="py-3 px-5">Swafoto</th>
                <th className="py-3 px-5">Jam Masuk</th>
                <th className="py-3 px-5">Jam Pulang</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data presensi pada periode yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const teacher = row.profiles || {};
                  const isTerlambat = row.status_masuk === 'TERLAMBAT';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5 font-medium text-slate-900">
                        {new Date(row.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{teacher.nama || 'Guru'}</div>
                        <div className="text-[11px] text-slate-400">
                          {teacher.nip ? `NIP. ${teacher.nip}` : teacher.jabatan || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          {row.foto_masuk_url ? (
                            <a
                              href={row.foto_masuk_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 block"
                            >
                              <img
                                src={row.foto_masuk_url}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {row.jam_masuk
                          ? new Date(row.jam_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {row.jam_pulang
                          ? new Date(row.jam_pulang).toLocaleTimeString('id-ID', {
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
