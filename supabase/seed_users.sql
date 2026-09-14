-- ====================================================================
-- SEED AKUN ADMIN & GURU (JALANKAN DI SUPABASE SQL EDITOR)
-- Ini akan langsung mengonfirmasi email dan membuat akun siap login
-- ====================================================================

-- 1. Pastikan ekstensi pgcrypto aktif untuk enkripsi password bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Fungsi helper untuk membuat user auth secara aman jika belum ada
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  guru1_id UUID := gen_random_uuid();
  guru2_id UUID := gen_random_uuid();
BEGIN

  -- -----------------------------------------------------------
  -- AKUN 1: ADMIN SEKOLAH (admin@sekolah.sch.id / admin123)
  -- -----------------------------------------------------------
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sekolah.sch.id') THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = jsonb_build_object('role', 'ADMIN', 'nama', 'Administrator Sekolah', 'full_name', 'Administrator Sekolah')
    WHERE email = 'admin@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@sekolah.sch.id',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"ADMIN","nama":"Administrator Sekolah","full_name":"Administrator Sekolah"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- -----------------------------------------------------------
  -- AKUN 2: GURU 1 (guru@sekolah.sch.id / guru123, NIP: 198501012010011001)
  -- -----------------------------------------------------------
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'guru@sekolah.sch.id') THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt('guru123', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = jsonb_build_object('role', 'GURU', 'nama', 'Budi Santoso, S.Pd.', 'nip', '198501012010011001', 'jabatan', 'Guru Matematika')
    WHERE email = 'guru@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      guru1_id,
      '00000000-0000-0000-0000-000000000000',
      'guru@sekolah.sch.id',
      crypt('guru123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"GURU","nama":"Budi Santoso, S.Pd.","nip":"198501012010011001","jabatan":"Guru Matematika"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- -----------------------------------------------------------
  -- AKUN 3: GURU 2 (siti@sekolah.sch.id / guru123, NIP: 198904122014032002)
  -- -----------------------------------------------------------
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti@sekolah.sch.id') THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt('guru123', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = jsonb_build_object('role', 'GURU', 'nama', 'Siti Aminah, M.Pd.', 'nip', '198904122014032002', 'jabatan', 'Guru Bahasa Indonesia')
    WHERE email = 'siti@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      guru2_id,
      '00000000-0000-0000-0000-000000000000',
      'siti@sekolah.sch.id',
      crypt('guru123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"GURU","nama":"Siti Aminah, M.Pd.","nip":"198904122014032002","jabatan":"Guru Bahasa Indonesia"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

END $$;

-- 3. Sinkronkan ke tabel public.profiles
INSERT INTO public.profiles (id, email, nama, nip, role, jabatan)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'nama', raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'nip',
  (raw_user_meta_data->>'role')::public.user_role,
  COALESCE(raw_user_meta_data->>'jabatan', 'Guru')
FROM auth.users
WHERE email IN ('admin@sekolah.sch.id', 'guru@sekolah.sch.id', 'siti@sekolah.sch.id')
ON CONFLICT (id) DO UPDATE
SET 
  role = EXCLUDED.role,
  nama = EXCLUDED.nama,
  nip = EXCLUDED.nip,
  jabatan = EXCLUDED.jabatan;

-- 4. Verifikasi hasil akun
SELECT id, email, nama, nip, role, jabatan FROM public.profiles;
