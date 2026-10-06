import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Lock,
  UserCheck,
  Quote,
  School,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { getDailyQuote } from '@/lib/motivationalQuotes';

export const dynamic = 'force-dynamic';

export default async function HomePage(props: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const forceShow = searchParams?.mode === 'dev';

  // Jika sudah login dan tidak dalam mode preview dev eksplisit, arahkan ke dashboard masing-masing
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !forceShow) {
      let role = user.user_metadata?.role;
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        role = profile?.role || 'GURU';
      }

      if (role === 'ADMIN') {
        redirect('/admin');
      } else {
        redirect('/guru');
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) {
      throw err;
    }
  }

  const quote = getDailyQuote();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#3a4a83] selection:text-white">
      {/* Navbar Minimalis */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-0.5">
              <Image
                src="/logo-smpn8karbar.webp"
                alt="Logo SMPN 8 Karawang Barat"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                SMP Negeri 8 Karawang Barat
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Presensi Pendidik & Tenaga Kependidikan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#3a4a83]/10 text-[#3a4a83] border border-[#3a4a83]/20">
              <Sparkles className="w-3 h-3 text-[#3a4a83]" /> TA 2026/2027
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3a4a83] hover:bg-[#2d3b6a] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Halaman Masuk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section & Kata Motivasi */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner Motivasi Guru */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3a4a83] via-[#2f3c6b] to-[#1e2646] text-white p-6 sm:p-8 shadow-sm">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
          <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
            <Quote className="w-24 h-24" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-sky-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Kata Motivasi Pendidik Hari Ini</span>
            </div>

            <blockquote className="text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-tight text-white/95 italic">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold tracking-wide uppercase pt-1">
              <span className="w-6 h-0.5 bg-amber-400 inline-block" />
              <span>{quote.author}</span>
            </div>
          </div>
        </section>

        {/* Development Mode / Demo Credentials Notice */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mode Siap Digunakan
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <KeyRound className="w-2.5 h-2.5" /> Quick Access
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                Panduan Akun Masuk (Pendidik & Tenaga Kependidikan)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih peran di bawah ini untuk melihat kredensial atau klik tombol untuk langsung masuk ke sistem.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3a4a83] hover:bg-[#2d3b6a] text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka Form Login</span>
            </Link>
          </div>

          {/* Grid Kredensial 3 Peran */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. ADMIN SEKOLAH */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between hover:border-[#3a4a83]/40 transition space-y-3">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#3a4a83]/10 text-[#3a4a83] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Administrator Sekolah</h3>
                  <p className="text-[11px] text-slate-500">Kelola guru, jadwal KBM, QR kelas, dan persetujuan izin.</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 text-[11px] font-mono space-y-1">
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold text-slate-900">admin@sekolah.sch.id</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Sandi:</span>
                    <span className="font-semibold text-slate-900">admin123</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?quick=admin"
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#3a4a83] hover:text-white border border-slate-300 text-[#3a4a83] text-[11px] font-semibold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Login sebagai Admin</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 2. KEPALA SEKOLAH */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between hover:border-[#3a4a83]/40 transition space-y-3">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Kepala Sekolah</h3>
                  <p className="text-[11px] text-slate-500">Mamay Abdullah, S.Pd., M.Pd. (Monitoring presensi & rekap).</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 text-[11px] font-mono space-y-1">
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold text-slate-900">kepsek@smpn8karawangbarat.sch.id</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">NIP:</span>
                    <span className="font-semibold text-slate-900">19700724 199802 1 003</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Sandi:</span>
                    <span className="font-semibold text-slate-900">guru123</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?quick=kepsek"
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#3a4a83] hover:text-white border border-slate-300 text-[#3a4a83] text-[11px] font-semibold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Login sebagai Kepsek</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 3. GURU PENGAJAR */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between hover:border-[#3a4a83]/40 transition space-y-3">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Guru / PKS Kurikulum</h3>
                  <p className="text-[11px] text-slate-500">Mardiyah, M.Pd. (Presensi selfie & scan QR kelas mengajar).</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 text-[11px] font-mono space-y-1">
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold text-slate-900 truncate pl-2">mardiyah@smpn8karawangbarat.sch.id</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">NIP:</span>
                    <span className="font-semibold text-slate-900">19720725 200501 2 007</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span className="text-slate-400">Sandi:</span>
                    <span className="font-semibold text-slate-900">guru123</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?quick=guru"
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#3a4a83] hover:text-white border border-slate-300 text-[#3a4a83] text-[11px] font-semibold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Login sebagai Guru</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Keterangan Tambahan Akun Guru Lainnya */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-[#3a4a83] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-slate-900">
                Tersedia 31 Guru SMPN 8 Karawang Barat dari Jadwal KBM TA 2026/2027:
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Semua guru dari data jadwal Excel (misal: <span className="font-semibold text-slate-700">Eti Anisyah, S.Pd.</span>, <span className="font-semibold text-slate-700">Ahmad Husen Multiana, S.Pd.</span>, dll.) dapat login menggunakan format email <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800">nama@smpn8karawangbarat.sch.id</code> atau NIP dengan kata sandi bawaan <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800">guru123</code> setelah menjalankan seed data.
              </p>
            </div>
          </div>
        </section>

        {/* Fitur Utama Presensi */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3a4a83]/10 text-[#3a4a83] flex items-center justify-center font-bold">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Geofencing & Foto Selfie</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Presensi kehadiran harian tervalidasi radius GPS sekolah dengan bukti foto kamera waktu nyata.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3a4a83]/10 text-[#3a4a83] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Presensi KBM Scan QR Kelas</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Guru memindai QR code unik di ruang kelas sesuai jadwal KBM 23 rombel dan mengisi materi ajar.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3a4a83]/10 text-[#3a4a83] flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Rekap & Jadwal Piket</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pantau jadwal guru piket dan ekspor laporan kehadiran bulanan untuk dinas pendidikan secara praktis.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SMP Negeri 8 Karawang Barat. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Karawang Barat, Jawa Barat • TA 2026/2027
          </p>
        </div>
      </footer>
    </div>
  );
}
