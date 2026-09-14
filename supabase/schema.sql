-- ==========================================================
-- SKEMA BASIS DATA: SISTEM ABSENSI GURU & TENAGA KEPENDIDIKAN
-- Jalankan skrip ini pada Supabase SQL Editor
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tipe Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'GURU');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM ('IZIN', 'SAKIT', 'CUTI');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Tabel Profil Pengguna
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nip VARCHAR(50) UNIQUE,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'GURU',
  jabatan VARCHAR(100),
  no_hp VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pengaturan Sekolah (Geofence & Jam Kerja)
CREATE TABLE IF NOT EXISTS public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sekolah VARCHAR(150) NOT NULL DEFAULT 'SMK Negeri 1 Teladan',
  alamat TEXT DEFAULT 'Jl. Pendidikan No. 1',
  latitude DOUBLE PRECISION NOT NULL DEFAULT -6.2088,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 106.8456,
  radius_meters INT NOT NULL DEFAULT 100,
  jam_masuk TIME NOT NULL DEFAULT '07:00:00',
  jam_pulang TIME NOT NULL DEFAULT '15:00:00',
  toleransi_terlambat_menit INT NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Presensi Harian
CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk TIMESTAMPTZ,
  foto_masuk_url TEXT,
  lat_masuk DOUBLE PRECISION,
  lng_masuk DOUBLE PRECISION,
  status_masuk VARCHAR(20) DEFAULT 'TEPAT_WAKTU', -- 'TEPAT_WAKTU' | 'TERLAMBAT'
  jam_pulang TIMESTAMPTZ,
  foto_pulang_url TEXT,
  lat_pulang DOUBLE PRECISION,
  lng_pulang DOUBLE PRECISION,
  status attendance_status DEFAULT 'HADIR',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_attendance_per_user_day UNIQUE (user_id, tanggal)
);

-- 6. Tabel Pengajuan Izin / Sakit / Cuti
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jenis leave_type NOT NULL,
  tgl_mulai DATE NOT NULL,
  tgl_selesai DATE NOT NULL,
  alasan TEXT NOT NULL,
  bukti_url TEXT,
  status leave_status DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.profiles(id),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Trigger Otomatis Sinkronisasi auth.users ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'nip', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'GURU'::public.user_role),
    COALESCE(new.raw_user_meta_data->>'jabatan', 'Guru')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Seed Data Pengaturan Sekolah Default (jika belum ada)
INSERT INTO public.school_settings (nama_sekolah, alamat, latitude, longitude, radius_meters, jam_masuk, jam_pulang, toleransi_terlambat_menit)
SELECT 'Sekolah Menengah Kejuruan', 'Jl. Merdeka No. 45', -6.2088, 106.8456, 100, '07:00:00', '15:00:00', 15
WHERE NOT EXISTS (SELECT 1 FROM public.school_settings);

-- 9. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user terautentikasi bisa membaca profil
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Policy: Admin bisa CRUD profil, Guru bisa update profil sendiri
CREATE POLICY "Allow users update own profile or admin" ON public.profiles
  FOR ALL TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Policy: Semua user bisa baca school_settings, Admin bisa update
CREATE POLICY "Allow read school_settings" ON public.school_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin update school_settings" ON public.school_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policy: Attendances
CREATE POLICY "Allow users read own attendances or admin" ON public.attendances
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Allow users insert own attendances or admin" ON public.attendances
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Allow users update own attendances or admin" ON public.attendances
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Policy: Leave Requests
CREATE POLICY "Allow users read own leaves or admin" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Allow users create own leaves" ON public.leave_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow admin update leaves" ON public.leave_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 10. Storage Buckets (Buka di Supabase Dashboard -> Storage)
-- Jalankan ini bila ingin membuat bucket otomatis lewat SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('presensi-selfie', 'presensi-selfie', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('bukti-izin', 'bukti-izin', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Siapa saja yang login bisa upload & baca
CREATE POLICY "Public Read presensi-selfie" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'presensi-selfie');

CREATE POLICY "Authenticated Upload presensi-selfie" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'presensi-selfie');

CREATE POLICY "Public Read bukti-izin" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'bukti-izin');

CREATE POLICY "Authenticated Upload bukti-izin" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bukti-izin');
