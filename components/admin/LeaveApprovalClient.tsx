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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Persetujuan Izin / Cuti Guru</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi dan berikan persetujuan atas permohonan ketidakhadiran guru
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Perlu Ditinjau ({pendingLeaves.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Riwayat Selesai</span>
          </button>
        </div>
      </div>

      {/* List Permohonan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentList.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Tidak ada permohonan izin pada kategori ini.
          </div>
        ) : (
          currentList.map((leave) => {
            const profile = leave.profiles || {};
            const isPending = leave.status === 'PENDING';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {profile.nama?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{profile.nama}</h4>
                        <p className="text-[11px] text-slate-400">
                          {profile.nip ? `NIP. ${profile.nip}` : profile.jabatan || 'Guru'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                      {leave.jenis}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {leave.tgl_mulai} s/d {leave.tgl_selesai}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">{leave.alasan}</p>
                  </div>

                  {leave.bukti_url && (
                    <a
                      href={leave.bukti_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Lampiran Surat / Bukti</span>
                    </a>
                  )}

                  {!isPending && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {leave.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleReview(leave.id, 'REJECTED')}
                      disabled={loadingId === leave.id}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>

                    <button
                      onClick={() => handleReview(leave.id, 'APPROVED')}
                      disabled={loadingId === leave.id}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      {loadingId === leave.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
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
