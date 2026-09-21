'use client';

import React, { useState } from 'react';
import { reviewLeaveAction } from '@/actions/admin';
import {
  Check,
  X,
  FileText,
  Calendar,
  User,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { LeaveRequest } from '@/types/database';

export default function LeaveApprovalClient({ initialLeaves }: { initialLeaves: any[] }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingLeaves = initialLeaves.filter((l) => l.status === 'PENDING');
  const historyLeaves = initialLeaves.filter((l) => l.status !== 'PENDING');

  async function handleReview(id: string, status: 'APPROVED' | 'REJECTED') {
    const promptMsg =
      status === 'APPROVED'
        ? 'Setujui permohonan izin ini?'
        : 'Masukkan alasan penolakan (opsional):';

    const catatan = status === 'REJECTED' ? prompt(promptMsg) || undefined : undefined;
    if (status === 'REJECTED' && catatan === null) return; // cancel clicked

    setLoadingId(id);
    const res = await reviewLeaveAction(id, status, catatan);
    setLoadingId(null);

    if (res.error) {
      alert('Gagal memperbarui status: ' + res.error);
    }
  }

  const currentList = activeTab === 'PENDING' ? pendingLeaves : historyLeaves;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Persetujuan Izin & Cuti</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjau dan verifikasi permohonan ketidakhadiran guru
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Perlu Ditinjau ({pendingLeaves.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Riwayat Selesai</span>
          </button>
        </div>
      </div>

      {/* List Permohonan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentList.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Tidak ada permohonan izin pada kategori ini.
          </div>
        ) : (
          currentList.map((leave) => {
            const profile = leave.profiles || {};
            const isPending = leave.status === 'PENDING';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200/60">
                        {profile.nama?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">{profile.nama}</h4>
                        <p className="text-[11px] text-slate-400">
                          {profile.nip ? `NIP. ${profile.nip}` : profile.jabatan || 'Guru'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      {leave.jenis}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {leave.tgl_mulai} s/d {leave.tgl_selesai}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1 text-xs">{leave.alasan}</p>
                  </div>

                  {leave.bukti_url && (
                    <a
                      href={leave.bukti_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Dokumen Bukti</span>
                    </a>
                  )}

                  {!isPending && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Keputusan:</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-md text-[11px] border ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {leave.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleReview(leave.id, 'REJECTED')}
                      disabled={loadingId === leave.id}
                      className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>

                    <button
                      onClick={() => handleReview(leave.id, 'APPROVED')}
                      disabled={loadingId === leave.id}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {loadingId === leave.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Setujui</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
