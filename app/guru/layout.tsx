import React from 'react';
import Link from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/actions/auth';
import { Home, Camera, FileText, History, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative pb-20">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              {profile?.nama?.charAt(0) || 'G'}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.nama || 'Bapak/Ibu Guru'}
              </h2>
              <p className="text-xs text-slate-500">
                {profile?.nip ? `NIP. ${profile.nip}` : profile?.jabatan || 'Pendidik'}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around">
          <NavLink href="/guru" label="Beranda">
            <Home className="w-5 h-5" />
          </NavLink>

          <NavLink href="/guru/presensi" label="Presensi" highlight>
            <Camera className="w-5 h-5" />
          </NavLink>

          <NavLink href="/guru/izin" label="Izin">
            <FileText className="w-5 h-5" />
          </NavLink>

          <NavLink href="/guru/riwayat" label="Riwayat">
            <History className="w-5 h-5" />
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
