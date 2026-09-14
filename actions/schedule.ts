'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 1. KELOLA KELAS
 */
export async function createClassAction(prevState: any, formData: FormData) {
  const nama_kelas = (formData.get('nama_kelas') as string)?.trim();
  const tingkat = (formData.get('tingkat') as string)?.trim() || 'X';
  const deskripsi = (formData.get('deskripsi') as string)?.trim() || null;

  if (!nama_kelas) {
    return { error: 'Nama kelas wajib diisi.' };
  }

  const supabase = await createClient();

  // Generate kode QR unik
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const cleanName = nama_kelas.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const kode_qr = `QR-KLS-${cleanName}-${randomSuffix}`;

  const { error } = await supabase.from('classes').insert({
    nama_kelas,
    tingkat,
    kode_qr,
    deskripsi,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/kelas');
  return { success: true, message: `Kelas ${nama_kelas} berhasil ditambahkan!` };
}

export async function deleteClassAction(classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').delete().eq('id', classId);
  if (error) return { error: error.message };
  revalidatePath('/admin/kelas');
  return { success: true };
}

/**
 * 2. KELOLA MATA PELAJARAN
 */
export async function createSubjectAction(prevState: any, formData: FormData) {
  const nama_mapel = (formData.get('nama_mapel') as string)?.trim();
  const kode_mapel = (formData.get('kode_mapel') as string)?.trim() || null;

  if (!nama_mapel) {
    return { error: 'Nama mata pelajaran wajib diisi.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('subjects').insert({
    nama_mapel,
    kode_mapel,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/kelas');
  revalidatePath('/admin/jadwal-mengajar');
  return { success: true, message: `Mata pelajaran ${nama_mapel} berhasil disimpan!` };
}

export async function deleteSubjectAction(subjectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
  if (error) return { error: error.message };
  revalidatePath('/admin/kelas');
  return { success: true };
}

/**
 * 3. KELOLA JADWAL MENGAJAR
 */
export async function createScheduleAction(prevState: any, formData: FormData) {
  const teacher_id = formData.get('teacher_id') as string;
  const class_id = formData.get('class_id') as string;
  const subject_id = formData.get('subject_id') as string;
  const hari = formData.get('hari') as string;
  const jam_mulai = formData.get('jam_mulai') as string;
  const jam_selesai = formData.get('jam_selesai') as string;

  if (!teacher_id || !class_id || !subject_id || !hari || !jam_mulai || !jam_selesai) {
    return { error: 'Semua kolom jadwal wajib diisi.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('teaching_schedules').insert({
    teacher_id,
    class_id,
    subject_id,
    hari,
    jam_mulai,
    jam_selesai,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/jadwal-mengajar');
  return { success: true, message: 'Jadwal pelajaran berhasil ditambahkan!' };
}

export async function deleteScheduleAction(scheduleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('teaching_schedules').delete().eq('id', scheduleId);
  if (error) return { error: error.message };
  revalidatePath('/admin/jadwal-mengajar');
  return { success: true };
}

/**
 * 4. PRESENSI KBM GURU DI KELAS (SCAN QR CODE KELAS)
 */
export async function submitClassCheckInAction(kode_qr: string, materi_pembelajaran?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir.' };
  }

  // 1. Cari kelas berdasarkan kode QR
  const { data: kelas, error: classErr } = await supabase
    .from('classes')
    .select('*')
    .eq('kode_qr', kode_qr.trim())
    .maybeSingle();

  if (classErr || !kelas) {
    return { error: 'Kode QR tidak valid atau kelas tidak ditemukan.' };
  }

  // 2. Dapatkan hari ini dalam bahasa Indonesia
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = days[new Date().getDay()];
  const todayDate = new Date().toISOString().split('T')[0];

  // 3. Cari jadwal mengajar guru di kelas ini hari ini
  const { data: schedule } = await supabase
    .from('teaching_schedules')
    .select('*, subjects(nama_mapel)')
    .eq('teacher_id', user.id)
    .eq('class_id', kelas.id)
    .eq('hari', todayDayName)
    .maybeSingle();

  // 4. Catat presensi masuk kelas
  const { data: attendance, error: insertErr } = await supabase
    .from('class_attendances')
    .insert({
      teacher_id: user.id,
      class_id: kelas.id,
      schedule_id: schedule?.id || null,
      tanggal: todayDate,
      jam_masuk: new Date().toISOString(),
      materi_pembelajaran: materi_pembelajaran || null,
    })
    .select()
    .single();

  if (insertErr) {
    return { error: 'Gagal mencatat presensi kelas: ' + insertErr.message };
  }

  revalidatePath('/guru');
  revalidatePath('/admin');

  return {
    success: true,
    nama_kelas: kelas.nama_kelas,
    nama_mapel: (schedule as any)?.subjects?.nama_mapel || 'Sesi Mengajar Mandiri',
    jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    message: `Presensi KBM di kelas ${kelas.nama_kelas} berhasil dicatat!`,
  };
}
