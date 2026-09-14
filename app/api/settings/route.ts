import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: settings, error } = await supabase
      .from('school_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !settings) {
      // Return default data jika database belum di-seed
      return NextResponse.json({
        nama_sekolah: 'SMK Negeri 1 Teladan',
        latitude: -6.2088,
        longitude: 106.8456,
        radius_meters: 100,
        jam_masuk: '07:00:00',
        jam_pulang: '15:00:00',
        toleransi_terlambat_menit: 15,
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({
      nama_sekolah: 'SMK Negeri 1 Teladan',
      latitude: -6.2088,
      longitude: 106.8456,
      radius_meters: 100,
      jam_masuk: '07:00:00',
      jam_pulang: '15:00:00',
      toleransi_terlambat_menit: 15,
    });
  }
}
