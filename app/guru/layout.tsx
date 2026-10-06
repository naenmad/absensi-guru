import React from 'react';
import Link from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/actions/auth';
import { Home, Camera, FileText, BarChart3, Settings, LogOut } from 'lucide-react';
import NavLink from '@/components/guru/NavLink';

export const dynamic = 'force-dynamic';

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  let profile = null;

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
  } catch (e) {
    console.error('Error getting profile in layout:', e);
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex justify-center text-slate-900">
      {/* Mobile Container */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col border-x border-slate-200/80 shadow-xs relative pb-20">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200/80 p-0.5 bg-white flex items-center justify-center">
              <img
                src="/logo-smpn8karbar.webp"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 leading-tight truncate">
                {profile?.nama || 'Guru'}
              </h2>
              <p className="text-[10px] text-slate-500 truncate">
                {profile?.nip ? `NIP. ${profile.nip}` : profile?.jabatan || 'Pendidik'}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1.5 py-1 flex items-center justify-around">
          <NavLink href="/guru" label="Beranda">
            <Home className="w-4 h-4" />
          </NavLink>

          <NavLink href="/guru/presensi" label="Presensi" highlight>
            <Camera className="w-4 h-4" />
          </NavLink>

          <NavLink href="/guru/statistik" label="Statistik">
            <BarChart3 className="w-4 h-4" />
          </NavLink>

          <NavLink href="/guru/izin" label="Izin">
            <FileText className="w-4 h-4" />
          </NavLink>

          <NavLink href="/guru/pengaturan" label="Akun">
            <Settings className="w-4 h-4" />
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
