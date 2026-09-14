'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Membuat akun guru baru oleh Admin
 */
export async function createTeacherAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama') as string;
  const nip = (formData.get('nip') as string)?.trim() || null;
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const jabatan = (formData.get('jabatan') as string)?.trim() || 'Guru';
  const no_hp = (formData.get('no_hp') as string)?.trim() || null;

  if (!nama || !email || !password) {
    return { error: 'Nama lengkap, email, dan password wajib diisi.' };
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 1. Cek apakah NIP sudah pernah terdaftar
    if (nip) {
      const { data: existingNip } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('nip', nip)
        .maybeSingle();

      if (existingNip) {
        return { error: `Guru dengan NIP ${nip} sudah terdaftar.` };
      }
    }

    // 2. Buat user di auth.users dengan email_confirm langsung aktif
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nama,
        full_name: nama,
        nip,
        role: 'GURU',
        jabatan,
      },
    });

    if (authError || !authData.user) {
      return { error: authError?.message || 'Gagal membuat akun guru.' };
    }

    // 3. Pastikan data tersimpan di tabel profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authData.user.id,
      nama,
      nip,
      email,
      role: 'GURU',
      jabatan,
      no_hp,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    revalidatePath('/admin/guru');
    return { success: true, message: `Akun untuk guru ${nama} berhasil dibuat!` };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem saat membuat akun guru.' };
  }
}

/**
 * Menghapus akun guru oleh Admin
 */
export async function deleteTeacherAction(userId: string) {
  try {
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/guru');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Gagal menghapus akun guru.' };
  }
}

/**
 * Memperbarui Pengaturan Titik Sekolah & Jam Kerja
 */
export async function updateSchoolSettingsAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const nama_sekolah = formData.get('nama_sekolah') as string;
  const alamat = formData.get('alamat') as string;
  const latitude = parseFloat(formData.get('latitude') as string);
  const longitude = parseFloat(formData.get('longitude') as string);
  const radius_meters = parseInt(formData.get('radius_meters') as string, 10);
  const jam_masuk = formData.get('jam_masuk') as string;
  const jam_pulang = formData.get('jam_pulang') as string;
  const toleransi_terlambat_menit = parseInt(formData.get('toleransi_terlambat_menit') as string, 10);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radius_meters)) {
    return { error: 'Koordinat lokasi atau radius tidak valid.' };
  }

  const supabase = await createClient();

  const updatePayload = {
    nama_sekolah,
    alamat,
    latitude,
    longitude,
    radius_meters,
    jam_masuk,
    jam_pulang,
    toleransi_terlambat_menit,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const res = await supabase.from('school_settings').update(updatePayload).eq('id', id);
    error = res.error;
  } else {
    const res = await supabase.from('school_settings').insert(updatePayload);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/jadwal');
  revalidatePath('/guru/presensi');
  return { success: true, message: 'Pengaturan sekolah berhasil disimpan!' };
}

/**
 * Menyetujui atau Menolak Permohonan Izin Guru
 */
export async function reviewLeaveAction(
  leaveId: string,
  status: 'APPROVED' | 'REJECTED',
  catatanAdmin?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('leave_requests')
    .update({
      status,
      approved_by: user.id,
      catatan_admin: catatanAdmin || null,
    })
    .eq('id', leaveId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/persetujuan');
  revalidatePath('/guru/izin');
  return { success: true };
}
