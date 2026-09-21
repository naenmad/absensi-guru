import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/actions/auth';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileCheck2,
  FileSpreadsheet,
  LogOut,
  School,
  CalendarDays,
  QrCode,
  BookOpen,
} from 'lucide-react';
import AdminSidebarLink from '@/components/admin/AdminSidebarLink';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let profile = null;
  let settings = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    }

    const { data: set } = await supabase.from('school_settings').select('*').limit(1).maybeSingle();
    settings = set;
  } catch (e) {
    console.error('Error fetching admin layout data:', e);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white shrink-0">
            <School className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-xs text-white truncate tracking-tight">
              {settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
            </h1>
            <span className="text-[11px] text-slate-400">Portal Administrasi</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>
          <AdminSidebarLink href="/admin" label="Dashboard Ringkasan">
            <LayoutDashboard className="w-4 h-4" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/guru" label="Data Guru & Akun">
            <Users className="w-4 h-4" />
          </AdminSidebarLink>

          <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Akademik & Ruangan
          </div>
          <AdminSidebarLink href="/admin/mapel" label="Mata Pelajaran">
            <BookOpen className="w-4 h-4" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/ruangan" label="Ruang Kelas & QR">
            <QrCode className="w-4 h-4" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/jadwal-pelajaran" label="Jadwal Pelajaran">
            <CalendarDays className="w-4 h-4" />
          </AdminSidebarLink>

          <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Konfigurasi & Rekap
          </div>
          <AdminSidebarLink href="/admin/jadwal" label="Lokasi & Jam Kerja">
            <MapPin className="w-4 h-4" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/persetujuan" label="Persetujuan Izin">
            <FileCheck2 className="w-4 h-4" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/laporan" label="Rekapitulasi Laporan">
            <FileSpreadsheet className="w-4 h-4" />
          </AdminSidebarLink>
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-3.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-slate-800">
              {profile?.nama?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">
                {profile?.nama || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{profile?.email || 'admin'}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-900">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              Tahun Ajaran {new Date().getFullYear()} / {new Date().getFullYear() + 1}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
              Admin Sekolah
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
