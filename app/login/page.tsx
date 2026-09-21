'use client';

import React, { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { School, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      // Next.js redirect melemparkan error redirect khusus (NEXT_REDIRECT)
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setError('Terjadi kesalahan saat mencoba masuk.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-7">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
            <School className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">SMP Negeri 8 Karawang Barat</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Presensi Pendidik & Tenaga Kependidikan
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              NIP atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="identifier"
                required
                placeholder="Masukkan NIP atau Email"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition placeholder:text-slate-400"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Gunakan NIP resmi atau alamat email terdaftar
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="Masukkan kata sandi"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Kendala akses akun? Hubungi bagian{' '}
            <span className="font-semibold text-slate-700">Tata Usaha</span>.
          </p>
        </div>
      </div>

      <div className="text-center mt-5 text-[11px] text-slate-400">
        Sistem Presensi SMP Negeri 8 Karawang Barat
      </div>
    </div>
  );
}
