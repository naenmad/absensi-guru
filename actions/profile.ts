'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Memperbarui Kata Sandi Pengguna yang Sedang Login
 */
export async function updatePasswordAction(prevState: any, formData: FormData) {
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password baru minimal 6 karakter.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi password baru tidak cocok.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: 'Gagal memperbarui kata sandi: ' + error.message };
  }

  return { success: true, message: 'Kata sandi berhasil diperbarui!' };
}

/**
 * Memperbarui Kontak / Nomor HP Pengguna
 */
export async function updateProfileAction(prevState: any, formData: FormData) {
  const no_hp = (formData.get('no_hp') as string)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      no_hp,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Gagal menyimpan profil: ' + error.message };
  }

  revalidatePath('/guru/pengaturan');
  revalidatePath('/guru');
  return { success: true, message: 'Nomor kontak berhasil diperbarui!' };
}
