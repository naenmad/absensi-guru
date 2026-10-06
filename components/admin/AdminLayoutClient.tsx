'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileCheck2,
  FileSpreadsheet,
  LogOut,
  CalendarDays,
  QrCode,
  BookOpen,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Sparkles,
} from 'lucide-react';
import AdminSidebarLink from './AdminSidebarLink';
import { Profile, SchoolSettings } from '@/types/database';

interface AdminLayoutClientProps {
  profile: Profile | null;
  settings: SchoolSettings | null;
  children: React.ReactNode;
}

type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

export default function AdminLayoutClient({
  profile,
  settings,
  children,
}: AdminLayoutClientProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(260);

  // Muat preferensi dari localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('admin_sidebar_mode') as SidebarMode | null;
      if (savedMode && ['expanded', 'collapsed', 'hidden'].includes(savedMode)) {
        setSidebarMode(savedMode);
      }
      const savedWidth = localStorage.getItem('admin_sidebar_width');
      if (savedWidth) {
        const num = parseInt(savedWidth, 10);
        if (!isNaN(num) && num >= 210 && num <= 420) {
          setSidebarWidth(num);
        }
      }
    } catch {
      // localStorage mungkin tidak tersedia di beberapa mode browser privasi
    }
  }, []);

  const changeMode = (newMode: SidebarMode) => {
    setSidebarMode(newMode);
    try {
      localStorage.setItem('admin_sidebar_mode', newMode);
    } catch {}
  };

  // Handler Drag Resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const newWidth = Math.min(420, Math.max(210, startWidthRef.current + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      try {
        localStorage.setItem('admin_sidebar_width', String(sidebarWidth));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isCollapsed = sidebarMode === 'collapsed';
  const isHidden = sidebarMode === 'hidden';

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex bg-slate-50 font-sans print:h-auto print:overflow-visible print:bg-white ${
        isDragging ? 'select-none cursor-col-resize' : ''
      }`}
    >
      {/* 1. BACKDROP MOBILE DRAWER */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* 2. DRAWER MOBILE (Tampil Saat Layar HP / Tablet & Menu Terbuka) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Mobile */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
              <img
                src="/logo-smpn8karbar.webp"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs text-white truncate tracking-tight">
                {settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
              </h1>
              <span className="text-[10px] text-slate-400">Portal Administrasi</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links Mobile */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>
          <AdminSidebarLink
            href="/admin"
            label="Dashboard Ringkasan"
            onClick={() => setIsMobileOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/guru"
            label="Data Guru & Akun"
            onClick={() => setIsMobileOpen(false)}
          >
            <Users className="w-4 h-4" />
          </AdminSidebarLink>

          <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Akademik & Ruangan
          </div>
          <AdminSidebarLink
            href="/admin/mapel"
            label="Mata Pelajaran"
            onClick={() => setIsMobileOpen(false)}
          >
            <BookOpen className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/ruangan"
            label="Ruang Kelas & QR"
            onClick={() => setIsMobileOpen(false)}
          >
            <QrCode className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/jadwal-pelajaran"
            label="Jadwal Pelajaran"
            onClick={() => setIsMobileOpen(false)}
          >
            <CalendarDays className="w-4 h-4" />
          </AdminSidebarLink>

          <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Konfigurasi & Rekap
          </div>
          <AdminSidebarLink
            href="/admin/jadwal"
            label="Lokasi & Jam Kerja"
            onClick={() => setIsMobileOpen(false)}
          >
            <MapPin className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/persetujuan"
            label="Persetujuan Izin"
            onClick={() => setIsMobileOpen(false)}
          >
            <FileCheck2 className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/statistik"
            label="Statistik & Kinerja"
            onClick={() => setIsMobileOpen(false)}
          >
            <BarChart3 className="w-4 h-4" />
          </AdminSidebarLink>
          <AdminSidebarLink
            href="/admin/laporan"
            label="Rekapitulasi Laporan"
            onClick={() => setIsMobileOpen(false)}
          >
            <FileSpreadsheet className="w-4 h-4" />
          </AdminSidebarLink>
        </nav>

        {/* Footer Profile Mobile */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-slate-800">
              {profile?.nama?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{profile?.nama || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{profile?.email || 'admin'}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* 3. SIDEBAR DESKTOP (Setinggi Layar h-screen, Sticky, Resizeable & Minimizable) */}
      {!isHidden && (
        <aside
          style={{ width: isCollapsed ? '68px' : `${sidebarWidth}px` }}
          className={`h-screen sticky top-0 shrink-0 bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800/80 transition-[width] duration-200 relative print:hidden hidden lg:flex z-30`}
        >
          {/* Brand Desktop */}
          <div
            className={`border-b border-slate-800 flex items-center transition-all ${
              isCollapsed ? 'p-3 justify-center' : 'p-4 gap-3'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
              <img
                src="/logo-smpn8karbar.webp"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-xs text-white truncate tracking-tight">
                  {settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
                </h1>
                <span className="text-[10px] text-slate-400">Portal Administrasi</span>
              </div>
            )}
          </div>

          {/* Nav Links Desktop */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {!isCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Menu Utama
              </div>
            )}
            <AdminSidebarLink href="/admin" label="Dashboard Ringkasan" isCollapsed={isCollapsed}>
              <LayoutDashboard className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink href="/admin/guru" label="Data Guru & Akun" isCollapsed={isCollapsed}>
              <Users className="w-4 h-4" />
            </AdminSidebarLink>

            {!isCollapsed && (
              <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Akademik & Ruangan
              </div>
            )}
            <AdminSidebarLink href="/admin/mapel" label="Mata Pelajaran" isCollapsed={isCollapsed}>
              <BookOpen className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink href="/admin/ruangan" label="Ruang Kelas & QR" isCollapsed={isCollapsed}>
              <QrCode className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink
              href="/admin/jadwal-pelajaran"
              label="Jadwal Pelajaran"
              isCollapsed={isCollapsed}
            >
              <CalendarDays className="w-4 h-4" />
            </AdminSidebarLink>

            {!isCollapsed && (
              <div className="px-3 pt-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Konfigurasi & Rekap
              </div>
            )}
            <AdminSidebarLink href="/admin/jadwal" label="Lokasi & Jam Kerja" isCollapsed={isCollapsed}>
              <MapPin className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink href="/admin/persetujuan" label="Persetujuan Izin" isCollapsed={isCollapsed}>
              <FileCheck2 className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink href="/admin/statistik" label="Statistik & Kinerja" isCollapsed={isCollapsed}>
              <BarChart3 className="w-4 h-4" />
            </AdminSidebarLink>
            <AdminSidebarLink href="/admin/laporan" label="Rekapitulasi Laporan" isCollapsed={isCollapsed}>
              <FileSpreadsheet className="w-4 h-4" />
            </AdminSidebarLink>
          </nav>

          {/* Quick Collapse & Mode Toggle Footer */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-around gap-1 text-[11px] text-slate-400">
            <button
              onClick={() => changeMode(isCollapsed ? 'expanded' : 'collapsed')}
              title={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan ke Ikon Saja'}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              {!isCollapsed && <span>{isCollapsed ? 'Perbesar' : 'Kecilkan Ikon'}</span>}
            </button>

            {!isCollapsed && (
              <button
                onClick={() => changeMode('hidden')}
                title="Sembunyikan Total Sidebar"
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Sembunyikan</span>
              </button>
            )}
          </div>

          {/* Footer User Profile Desktop */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-slate-800">
                {profile?.nama?.charAt(0) || 'A'}
              </div>
              {!isCollapsed && (
                <div className="truncate min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {profile?.nama || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{profile?.email || 'admin'}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Keluar Akun"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Resizable Drag Handle (Hanya aktif saat mode expanded) */}
          {!isCollapsed && (
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 right-0 bottom-0 w-1.5 hover:w-2 hover:bg-[#3a4a83] active:bg-[#3a4a83] cursor-col-resize transition-all z-40 group"
              title="Geser untuk mengubah lebar sidebar"
            >
              <div className="w-full h-full group-hover:bg-[#3a4a83]/50" />
            </div>
          )}
        </aside>
      )}

      {/* 4. MAIN WORKSPACE AREA (Scrollable Vertikal, Topbar Sticky) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:w-full">
        {/* Top bar sticky */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            {/* Tombol Hamburger Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Tombol Tampilkan Sidebar jika mode Desktop Hidden */}
            {isHidden && (
              <button
                type="button"
                onClick={() => changeMode('expanded')}
                className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                title="Tampilkan Kembali Sidebar"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
                <span>Tampilkan Sidebar</span>
              </button>
            )}

            {/* Tombol Quick Minimize jika mode Desktop */}
            {!isHidden && (
              <button
                type="button"
                onClick={() => changeMode(isCollapsed ? 'expanded' : 'collapsed')}
                className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                title={isCollapsed ? 'Perbesar Menu' : 'Kecilkan Menu (Ikon Saja)'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}

            {/* Tanggal & Waktu */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">TA 2026/2027</span>
            </div>
          </div>

          {/* Topbar Right Actions */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#3a4a83]/10 text-[#3a4a83] rounded-md text-xs font-bold border border-[#3a4a83]/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#3a4a83]" />
              <span>Admin Sekolah</span>
            </span>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#3a4a83] text-white flex items-center justify-center font-bold text-xs">
                {profile?.nama?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden md:block max-w-[140px] truncate">
                {profile?.nama || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area (Hanya bagian ini yang scroll ke bawah) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
