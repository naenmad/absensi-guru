'use client';

import React, { useState } from 'react';
import { updatePasswordAction, updateProfileAction } from '@/actions/profile';
import { logoutAction } from '@/actions/auth';
import {
  User,
  Lock,
  Phone,
  Mail,
  Shield,
  School,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';

interface PengaturanClientProps {
  profile: any;
  schoolName: string;
}

export default function PengaturanClient({ profile, schoolName }: PengaturanClientProps) {
  // State form profil
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  // State form password
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(null, formData);
    setProfileLoading(false);

    if (res.error) {
      setProfileFeedback({ error: res.error });
    } else {
      setProfileFeedback({ success: true, message: res.message });
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await updatePasswordAction(null, formData);
    setPasswordLoading(false);

    if (res.error) {
      setPasswordFeedback({ error: res.error });
    } else {
      setPasswordFeedback({ success: true, message: res.message });
      form.reset();
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Halaman */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Pengaturan & Profil Akun</h2>
        <p className="text-[11px] text-slate-500">Kelola informasi kontak dan keamanan akun Anda</p>
      </div>

      {/* Kartu Identitas Guru */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {profile?.nama?.charAt(0) || 'G'}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{profile?.nama || 'Guru'}</h3>
            <p className="text-xs text-slate-500">
              {profile?.nip ? `NIP. ${profile.nip}` : 'Tenaga Pendidik'}
            </p>
            <span className="inline-block mt-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {profile?.jabatan || 'Pendidik'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500">
              <School className="w-3.5 h-3.5" /> Unit Sekolah
            </span>
            <span className="font-medium text-slate-900">{schoolName}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3.5 h-3.5" /> Email Akun
            </span>
            <span className="font-mono text-slate-900 text-[11px]">{profile?.email || '-'}</span>
          </div>
        </div>
      </div>

      {/* Form Pembaruan Kontak / No HP */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
          <Phone className="w-4 h-4 text-slate-500" />
          <span>Informasi Kontak Telepon</span>
        </div>

        {profileFeedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border ${
              profileFeedback.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {profileFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{profileFeedback.message || profileFeedback.error}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              name="no_hp"
              defaultValue={profile?.no_hp || ''}
              placeholder="Contoh: 081234567890"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Digunakan untuk notifikasi presensi dan koordinasi pihak sekolah.
            </span>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {profileLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Nomor Kontak</span>
            )}
          </button>
        </form>
      </div>

      {/* Form Keamanan / Ganti Password */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>Ubah Kata Sandi Akun</span>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border ${
              passwordFeedback.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {passwordFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{passwordFeedback.message || passwordFeedback.error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              name="new_password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              minLength={6}
              placeholder="Ketik ulang kata sandi baru"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memperbarui Kata Sandi...</span>
              </>
            ) : (
              <span>Perbarui Kata Sandi</span>
            )}
          </button>
        </form>
      </div>

      {/* Tombol Logout */}
      <form action={logoutAction} className="pt-1">
        <button
          type="submit"
          className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </form>
    </div>
  );
}
