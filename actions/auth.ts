'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const emailOrNip = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  if (!emailOrNip || !password) {
    return { error: 'Email/NIP dan password wajib diisi.' };
  }

  const supabase = await createClient();

  let loginEmail = emailOrNip.trim();

  // Jika user memasukkan NIP (bukan format email @), cari email terlebih dahulu dari tabel profiles
  // Gunakan admin client karena user belum terautentikasi (RLS profiles hanya untuk authenticated)
  if (!loginEmail.includes('@')) {
    const supabaseAdmin = createAdminClient();
    const { data: profile, error: nipError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('nip', loginEmail)
      .maybeSingle();

    if (nipError || !profile) {
      return { error: 'NIP tidak ditemukan dalam sistem.' };
    }
    loginEmail = profile.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: password,
  });

  if (error) {
    return { error: 'Email/NIP atau kata sandi tidak valid.' };
  }

  // Cek role untuk menentukan redirect
  let role = data.user.user_metadata?.role;
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    role = profile?.role || 'GURU';
  }

  const targetUrl = role === 'ADMIN' ? '/admin' : '/guru';
  redirect(targetUrl);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
