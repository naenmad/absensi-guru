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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {result && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border ${
            result.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{result.message || result.error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Kategori Permohonan
        </label>
        <select
          name="jenis"
          required
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
        >
          <option value="IZIN">Izin (Keperluan Pribadi / Keluarga)</option>
          <option value="SAKIT">Sakit</option>
          <option value="CUTI">Cuti Resmi</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Mulai Tanggal</label>
          <input
            type="date"
            name="tgl_mulai"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            name="tgl_selesai"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Alasan / Keterangan
        </label>
        <textarea
          name="alasan"
          required
          rows={3}
          placeholder="Tuliskan keterangan permohonan izin..."
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Lampiran Bukti (Opsional)
        </label>
        <div className="relative border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition text-center cursor-pointer">
          <input
            type="file"
            name="bukti"
            accept="image/*,.pdf"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center pointer-events-none text-slate-500">
            <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-700">
              Pilih file foto atau dokumen
            </span>
            <span className="text-[10px] text-slate-400">JPG, PNG, atau PDF (Maks. 5MB)</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Mengirim Permohonan...</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Permohonan</span>
          </>
        )}
      </button>
    </form>
  );
}
