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
    <div className="w-full max-w-md">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Presensi Guru</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Informasi Kehadiran Pendidik & Tenaga Kependidikan
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              NIP atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="identifier"
                required
                placeholder="Masukkan NIP atau Email akun Anda"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Guru dapat login menggunakan NIP resmi atau alamat email.
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <span>Masuk ke Sistem</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Belum memiliki akun atau lupa kata sandi? Silakan hubungi bagian{' '}
            <span className="font-semibold text-slate-700">Tata Usaha / Admin Sekolah</span>.
          </p>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Sistem Presensi Sekolah. All rights reserved.
      </div>
    </div>
  );
}
