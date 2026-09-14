'use client';

import React, { useState } from 'react';
import { submitLeaveAction } from '@/actions/izin';
import { Send, Loader2, AlertCircle, CheckCircle2, UploadCloud } from 'lucide-react';

export default function FormIzinClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await submitLeaveAction(formData);
    setLoading(false);

    if (res.error) {
      setResult({ error: res.error });
    } else {
      setResult({ success: true, message: res.message });
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 border ${
            result.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{result.message || result.error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Kategori Permohonan
        </label>
        <select
          name="jenis"
          required
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="IZIN">Izin (Keperluan Pribadi / Keluarga)</option>
          <option value="SAKIT">Sakit</option>
          <option value="CUTI">Cuti Resmi</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mulai Tanggal</label>
          <input
            type="date"
            name="tgl_mulai"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            name="tgl_selesai"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Alasan / Keterangan Lengkap
        </label>
        <textarea
          name="alasan"
          required
          rows={3}
          placeholder="Jelaskan alasan ketidakhadiran Anda secara ringkas..."
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lampiran Bukti (Opsional / Surat Dokter)
        </label>
        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-slate-100 transition text-center cursor-pointer">
          <input
            type="file"
            name="bukti"
            accept="image/*,.pdf"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center pointer-events-none text-slate-500">
            <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-600">
              Pilih foto surat atau klik untuk upload
            </span>
            <span className="text-[10px] text-slate-400">JPG, PNG, atau PDF (Maks. 5MB)</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim Pengajuan...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Kirim Permohonan Izin</span>
          </>
        )}
      </button>
    </form>
  );
}
