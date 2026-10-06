'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import {
  Lock,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  Quote,
  ArrowRight,
  ShieldCheck,
  School,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getDailyQuote } from '@/lib/motivationalQuotes';

function LoginForm() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDevQuickLogin, setShowDevQuickLogin] = useState(true);

  // Quote motivasi harian
  const dailyQuote = getDailyQuote();

  // Tangani parameter query seperti ?quick=admin atau ?quick=guru
  useEffect(() => {
    const quick = searchParams.get('quick');
    if (quick === 'admin') {
      setIdentifier('admin@sekolah.sch.id');
      setPassword('admin123');
    } else if (quick === 'kepsek') {
      setIdentifier('kepsek@smpn8karawangbarat.sch.id');
      setPassword('guru123');
    } else if (quick === 'guru') {
      setIdentifier('mardiyah@smpn8karawangbarat.sch.id');
      setPassword('guru123');
    }
  }, [searchParams]);

  function fillCredentials(idVal: string, passVal: string) {
    setIdentifier(idVal);
    setPassword(passVal);
    setError(null);
  }

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
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setError('Terjadi kesalahan saat mencoba masuk.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-4 font-sans">
      {/* Kartu Login Utama */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="group inline-block mb-3">
            <div className="w-16 h-16 rounded-2xl p-1 bg-white border border-slate-200/80 shadow-2xs group-hover:scale-105 transition flex items-center justify-center">
              <Image
                src="/logo-smpn8karbar.webp"
                alt="Logo SMPN 8 Karawang Barat"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            SMP Negeri 8 Karawang Barat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Presensi Pendidik & Tenaga Kependidikan
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
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
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIP atau Email"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#3a4a83] focus:ring-1 focus:ring-[#3a4a83] transition placeholder:text-slate-400"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#3a4a83] focus:ring-1 focus:ring-[#3a4a83] transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#3a4a83] hover:bg-[#2d3b6a] text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Development Mode Quick Fill Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDevQuickLogin(!showDevQuickLogin)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:text-[#3a4a83] transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3a4a83]" />
              <span>Akses Cepat Pengembang (Dev Mode)</span>
            </span>
            {showDevQuickLogin ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showDevQuickLogin && (
            <div className="mt-2.5 space-y-1.5 animate-fadeIn">
              <p className="text-[11px] text-slate-500 mb-2">
                Klik peran di bawah untuk mengisi akun otomatis:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@sekolah.sch.id', 'admin123')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-[#3a4a83]/10 border border-slate-200 text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-[#3a4a83]">
                    <ShieldCheck className="w-3 h-3 text-[#3a4a83]" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate">admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fillCredentials('kepsek@smpn8karawangbarat.sch.id', 'guru123')
                  }
                  className="p-2 rounded-lg bg-slate-50 hover:bg-[#3a4a83]/10 border border-slate-200 text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-[#3a4a83]">
                    <School className="w-3 h-3 text-amber-600" />
                    <span>Kepsek</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate">Mamay A.</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fillCredentials('mardiyah@smpn8karawangbarat.sch.id', 'guru123')
                  }
                  className="p-2 rounded-lg bg-slate-50 hover:bg-[#3a4a83]/10 border border-slate-200 text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-[#3a4a83]">
                    <GraduationCap className="w-3 h-3 text-sky-600" />
                    <span>Guru / PKS</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate">Mardiyah</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Box Kata Motivasi Guru Harian */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#3a4a83]/10 via-[#3a4a83]/5 to-transparent border border-[#3a4a83]/20 text-slate-700 relative overflow-hidden">
        <Quote className="w-8 h-8 text-[#3a4a83]/15 absolute right-2.5 top-2.5 pointer-events-none" />
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3a4a83] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kata Motivasi Pendidik Hari Ini</span>
        </div>
        <p className="text-xs italic text-slate-800 leading-relaxed">
          &ldquo;{dailyQuote.quote}&rdquo;
        </p>
        <span className="text-[10px] font-medium text-slate-500 block mt-1.5">
          — {dailyQuote.author}
        </span>
      </div>

      <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <Link href="/" className="hover:text-[#3a4a83] transition">
          Beranda Utama
        </Link>
        <span>•</span>
        <span>SMP Negeri 8 Karawang Barat</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 text-center text-slate-400 text-xs">
          Memuat halaman login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
