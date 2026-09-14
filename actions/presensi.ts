'use server';

import { createClient } from '@/lib/supabase/server';
import { isWithinSchoolRadius } from '@/lib/geo';
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

  // 1. Ambil pengaturan sekolah untuk verifikasi geofence & jam masuk
  const { data: settings, error: settingsError } = await supabase
    .from('school_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (settingsError || !settings) {
    return { error: 'Pengaturan lokasi sekolah belum dikonfigurasi oleh Admin.' };
  }

  // 2. Validasi Geofencing
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

  // 3. Upload Foto Selfie ke Supabase Storage
  let fotoUrl = '';
  try {
    const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `${user.id}/${todayStr}_${tipe.toLowerCase()}_${Date.now()}.jpg`;

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
      // Jika bucket belum siap di cloud, simpan inline / data url untuk testing lokal
      fotoUrl = fotoBase64;
    }
  } catch (err) {
    fotoUrl = fotoBase64;
  }

  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];

  // 4. Hitung Keterlambatan untuk Presensi Masuk
  let statusMasuk: 'TEPAT_WAKTU' | 'TERLAMBAT' = 'TEPAT_WAKTU';
  if (tipe === 'MASUK') {
    const [jamMasukH, jamMasukM] = settings.jam_masuk.split(':').map(Number);
    const batasMenit = jamMasukH * 60 + jamMasukM + (settings.toleransi_terlambat_menit || 0);

    // Waktu lokal server / WIB
    const currentMenit = now.getHours() * 60 + now.getMinutes();
    if (currentMenit > batasMenit) {
      statusMasuk = 'TERLAMBAT';
    }
  }

  // 5. Simpan ke database attendances
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
  revalidatePath('/guru/riwayat');
  revalidatePath('/admin');

  return {
    success: true,
    tipe,
    statusMasuk,
    waktu: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    jarakMeters: geoCheck.distanceMeters,
    message:
      tipe === 'MASUK'
        ? `Presensi masuk berhasil (${statusMasuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'})`
        : 'Presensi pulang berhasil dicatat. Selamat beristirahat!',
  };
}
