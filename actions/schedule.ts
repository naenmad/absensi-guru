'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getWIBDateString, getWIBDayName, formatTimeWIB } from '@/lib/date';

/**
 * 1. KELOLA MATA PELAJARAN
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

  revalidatePath('/admin/mapel');
  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true, message: `Mata pelajaran "${nama_mapel}" berhasil ditambahkan!` };
}

export async function deleteSubjectAction(subjectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
  if (error) return { error: error.message };
  revalidatePath('/admin/mapel');
  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true };
}

/**
 * 2. KELOLA RUANG KELAS (QR Code di-generate per Ruangan)
 */
export async function createRoomAction(prevState: any, formData: FormData) {
  const nama_ruangan = (formData.get('nama_ruangan') as string)?.trim();
  const gedung = (formData.get('gedung') as string)?.trim() || null;
  const deskripsi = (formData.get('deskripsi') as string)?.trim() || null;

  if (!nama_ruangan) {
    return { error: 'Nama ruang kelas wajib diisi.' };
  }

  const supabase = await createClient();

  // Generate kode QR unik untuk ruangan ini
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const cleanName = nama_ruangan.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const kode_qr = `QR-RUANG-${cleanName}-${randomSuffix}`;

  const { error } = await supabase.from('rooms').insert({
    nama_ruangan,
    gedung,
    deskripsi,
    kode_qr,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/ruangan');
  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true, message: `Ruang "${nama_ruangan}" berhasil dibuat dengan QR Code unik!` };
}

export async function deleteRoomAction(roomId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) return { error: error.message };
  revalidatePath('/admin/ruangan');
  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true };
}

/**
 * 3. KELOLA JADWAL PELAJARAN (Menyambungkan Guru + Mata Pelajaran + Ruang Kelas)
 */
export async function createScheduleAction(prevState: any, formData: FormData) {
  const teacher_id = formData.get('teacher_id') as string;
  const subject_id = formData.get('subject_id') as string;
  const room_id = formData.get('room_id') as string;
  const hari = formData.get('hari') as string;
  const jam_mulai = formData.get('jam_mulai') as string;
  const jam_selesai = formData.get('jam_selesai') as string;

  if (!teacher_id || !subject_id || !room_id || !hari || !jam_mulai || !jam_selesai) {
    return { error: 'Semua kolom jadwal wajib diisi lengkap.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('schedules').insert({
    teacher_id,
    subject_id,
    room_id,
    hari,
    jam_mulai,
    jam_selesai,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true, message: 'Jadwal pelajaran berhasil ditambahkan!' };
}

export async function deleteScheduleAction(scheduleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
  if (error) return { error: error.message };
  revalidatePath('/admin/jadwal-pelajaran');
  return { success: true };
}

/**
 * 4. PRESENSI KBM GURU DI RUANG KELAS (SCAN QR RUANGAN)
 */
export async function submitRoomAttendanceAction(kode_qr: string, materi_pembelajaran?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' };
  }

  // 1. Cari ruangan berdasarkan kode QR yang di-scan
  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('kode_qr', kode_qr.trim())
    .maybeSingle();

  if (roomErr || !room) {
    return { error: 'QR Code tidak valid atau Ruangan tidak ditemukan dalam sistem.' };
  }

  // 2. Tentukan nama hari & tanggal WIB saat ini
  const todayDayName = getWIBDayName(new Date());
  const todayDate = getWIBDateString(new Date());

  // 3. Cari jadwal mengajar guru di ruangan ini pada hari ini
  const { data: activeSchedule } = await supabase
    .from('schedules')
    .select('*, subjects(nama_mapel)')
    .eq('teacher_id', user.id)
    .eq('room_id', room.id)
    .eq('hari', todayDayName)
    .maybeSingle();

  // 4. Cek apakah guru sudah pernah check-in di ruangan ini hari ini
  const { data: existingRoomAtt } = await supabase
    .from('room_attendances')
    .select('*')
    .eq('room_id', room.id)
    .eq('teacher_id', user.id)
    .eq('tanggal', todayDate)
    .maybeSingle();

  if (existingRoomAtt) {
    return {
      success: true,
      alreadyCheckedIn: true,
      nama_ruangan: room.nama_ruangan,
      gedung: room.gedung || 'Ruang Kelas',
      nama_mapel: (activeSchedule as any)?.subjects?.nama_mapel || 'Sesi Pelajaran',
      jam: formatTimeWIB(existingRoomAtt.jam_masuk),
      message: `Anda sudah tercatat check-in di ${room.nama_ruangan} hari ini pada pukul ${formatTimeWIB(existingRoomAtt.jam_masuk)}.`,
    };
  }

  // 5. Catat presensi masuk ruangan ke tabel room_attendances
  const now = new Date();
  const { error: insertErr } = await supabase.from('room_attendances').insert({
    room_id: room.id,
    teacher_id: user.id,
    schedule_id: activeSchedule?.id || null,
    tanggal: todayDate,
    jam_masuk: now.toISOString(),
    materi_pembelajaran: materi_pembelajaran || null,
  });

  if (insertErr) {
    return { error: 'Gagal mencatat presensi ruangan: ' + insertErr.message };
  }

  revalidatePath('/guru');
  revalidatePath('/admin');

  return {
    success: true,
    nama_ruangan: room.nama_ruangan,
    gedung: room.gedung || 'Ruang Kelas',
    nama_mapel: (activeSchedule as any)?.subjects?.nama_mapel || 'Sesi Pelajaran',
    jam: formatTimeWIB(now.toISOString()),
    message: `Presensi KBM di ${room.nama_ruangan} berhasil dicatat!`,
  };
}
