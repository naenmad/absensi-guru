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
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">
              {settings?.nama_sekolah || 'Admin Presensi'}
            </h1>
            <span className="text-[11px] text-blue-400 font-medium">Panel Administrasi</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <AdminSidebarLink href="/admin" label="Dashboard Ringkasan">
            <LayoutDashboard className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/guru" label="Data Guru & Akun">
            <Users className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/mapel" label="1. Mata Pelajaran">
            <BookOpen className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/ruangan" label="2. Ruang Kelas & QR">
            <QrCode className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/jadwal-pelajaran" label="3. Jadwal Pelajaran">
            <CalendarDays className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/jadwal" label="Lokasi & Jam Kerja">
            <MapPin className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/persetujuan" label="Persetujuan Izin">
            <FileCheck2 className="w-5 h-5" />
          </AdminSidebarLink>

          <AdminSidebarLink href="/admin/laporan" label="Rekapitulasi Laporan">
            <FileSpreadsheet className="w-5 h-5" />
          </AdminSidebarLink>
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
              {profile?.nama?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.nama || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{profile?.email || 'admin'}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Tahun Ajaran {new Date().getFullYear()} / {new Date().getFullYear() + 1}
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
              Role: Admin Sekolah
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
