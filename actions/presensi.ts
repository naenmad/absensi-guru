'use server';

import { createClient } from '@/lib/supabase/server';
import { isWithinSchoolRadius } from '@/lib/geo';
import { getWIBDateString, formatTimeWIB, TIMEZONE_WIB } from '@/lib/date';
import { revalidatePath } from 'next/cache';

interface PresensiPayload {
  tipe: 'MASUK' | 'PULANG';
  latitude: number;
  longitude: number;
  fotoBase64: string; // Data URL format: "data:image/jpeg;base64,..."
  catatan?: string;
}

export async function submitPresensiAction(payload: PresensiPayload) {
  const { tipe, latitude, longitude, fotoBase64, catatan } = payload;

  if (!latitude || !longitude || !fotoBase64) {
    return { error: 'Data lokasi atau foto selfie tidak lengkap.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' };
  }

  const now = new Date();
  const todayDate = getWIBDateString(now);

  // 1. Cek apakah sudah ada catatan presensi hari ini
  const { data: existingAttendance } = await supabase
    .from('attendances')
    .select('*')
    .eq('user_id', user.id)
    .eq('tanggal', todayDate)
    .maybeSingle();

  // 2. Validasi pencegahan presensi ganda
  if (tipe === 'MASUK') {
    if (existingAttendance?.jam_masuk) {
      return {
        error: `Anda sudah melakukan presensi masuk hari ini pada pukul ${formatTimeWIB(existingAttendance.jam_masuk)}. Presensi masuk tidak dapat diulang.`,
      };
    }
    if (existingAttendance?.status === 'IZIN' || existingAttendance?.status === 'SAKIT') {
      return {
        error: `Anda tercatat sedang ${existingAttendance.status} hari ini. Tidak perlu melakukan presensi masuk.`,
      };
    }
  } else {
    // PULANG
    if (!existingAttendance || !existingAttendance.jam_masuk) {
      return {
        error: 'Anda belum melakukan presensi masuk hari ini. Silakan lakukan presensi masuk terlebih dahulu sebelum presensi pulang.',
      };
    }
    if (existingAttendance.jam_pulang) {
      return {
        error: `Anda sudah melakukan presensi pulang hari ini pada pukul ${formatTimeWIB(existingAttendance.jam_pulang)}. Presensi pulang tidak dapat diulang.`,
      };
    }
  }

  // 3. Ambil pengaturan sekolah untuk verifikasi geofence & jam masuk
  const { data: settings, error: settingsError } = await supabase
    .from('school_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (settingsError || !settings) {
    return { error: 'Pengaturan lokasi sekolah belum dikonfigurasi oleh Admin.' };
  }

  // 4. Validasi Geofencing
  const geoCheck = isWithinSchoolRadius(
    latitude,
    longitude,
    settings.latitude,
    settings.longitude,
    settings.radius_meters
  );

  if (!geoCheck.isWithin) {
    return {
      error: `Presensi gagal! Anda berada ${geoCheck.distanceMeters} meter dari sekolah (Radius maksimal: ${settings.radius_meters} meter).`,
      distanceMeters: geoCheck.distanceMeters,
    };
  }

  // 5. Upload Foto Selfie ke Supabase Storage
  let fotoUrl = '';
  try {
    const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${user.id}/${todayDate}_${tipe.toLowerCase()}_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('presensi-selfie')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('presensi-selfie').getPublicUrl(fileName);
      fotoUrl = publicUrl;
    } else {
      fotoUrl = fotoBase64;
    }
  } catch {
    fotoUrl = fotoBase64;
  }

  // 6. Hitung Keterlambatan untuk Presensi Masuk (WIB)
  let statusMasuk: 'TEPAT_WAKTU' | 'TERLAMBAT' = 'TEPAT_WAKTU';
  if (tipe === 'MASUK') {
    const [jamMasukH, jamMasukM] = (settings.jam_masuk || '07:00:00').split(':').map(Number);
    const batasMenit = jamMasukH * 60 + jamMasukM + (settings.toleransi_terlambat_menit || 0);

    const nowWIB = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE_WIB,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(now);
    const [currH, currM] = nowWIB.split(':').map(Number);
    const currentMenit = currH * 60 + currM;

    if (currentMenit > batasMenit) {
      statusMasuk = 'TERLAMBAT';
    }
  }

  // 7. Simpan ke database attendances
  if (tipe === 'MASUK') {
    const { error: upsertError } = await supabase.from('attendances').upsert(
      {
        user_id: user.id,
        tanggal: todayDate,
        jam_masuk: now.toISOString(),
        foto_masuk_url: fotoUrl,
        lat_masuk: latitude,
        lng_masuk: longitude,
        status_masuk: statusMasuk,
        status: statusMasuk === 'TERLAMBAT' ? 'TERLAMBAT' : 'HADIR',
        catatan: catatan || null,
      },
      { onConflict: 'user_id,tanggal' }
    );

    if (upsertError) {
      return { error: 'Gagal mencatat presensi masuk: ' + upsertError.message };
    }
  } else {
    // PULANG
    const { error: updateError } = await supabase
      .from('attendances')
      .update({
        jam_pulang: now.toISOString(),
        foto_pulang_url: fotoUrl,
        lat_pulang: latitude,
        lng_pulang: longitude,
      })
      .eq('user_id', user.id)
      .eq('tanggal', todayDate);

    if (updateError) {
      return { error: 'Gagal mencatat presensi pulang: ' + updateError.message };
    }
  }

  revalidatePath('/guru');
  revalidatePath('/guru/presensi');
  revalidatePath('/guru/riwayat');
  revalidatePath('/admin');

  return {
    success: true,
    tipe,
    statusMasuk,
    waktu: formatTimeWIB(now.toISOString()),
    jarakMeters: geoCheck.distanceMeters,
    message:
      tipe === 'MASUK'
        ? `Presensi masuk berhasil dicatat (${statusMasuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'})`
        : 'Presensi pulang berhasil dicatat. Selamat beristirahat!',
  };
}
