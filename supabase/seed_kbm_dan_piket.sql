-- ====================================================================
-- MIGRASI & SEED MASTER DATA KBM & PIKET SMP NEGERI 8 KARAWANG BARAT
-- TAHUN PELAJARAN 2026 / 2027 (SEMESTER GANJIL)
-- Jalankan script ini pada Supabase SQL Editor
-- ====================================================================

-- 1. PENYESUAIAN SKEMA TABEL (Agar Lebih Proper & Siap untuk KBM & Piket)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tambah kolom kode_guru pada profiles jika belum ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kode_guru INT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_kode_guru ON public.profiles(kode_guru) WHERE kode_guru IS NOT NULL;

-- Tambah kolom tingkat & wali_kelas_id pada rooms jika belum ada
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS tingkat VARCHAR(10);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS wali_kelas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Tambah kolom jam_ke pada schedules jika belum ada
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS jam_ke VARCHAR(20);

-- Tambah tabel picket_schedules (Jadwal Guru Piket)
CREATE TABLE IF NOT EXISTS public.picket_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hari VARCHAR(20) NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nama_petugas VARCHAR(150) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_picket_per_day UNIQUE (hari, teacher_id)
);

ALTER TABLE public.picket_schedules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow read picket schedules" ON public.picket_schedules FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow admin manage picket schedules" ON public.picket_schedules FOR ALL TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null;
END $$;


-- 2. SEED SEMUA AKUN GURU & PIMPINAN KE auth.users & public.profiles
DO $$
DECLARE
  new_id UUID;
BEGIN

  -- Akun: Eti Anisyah, S.Pd. (Kode: 1)
  SELECT id INTO new_id FROM auth.users WHERE email = 'eti.anisyah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'eti.anisyah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Eti Anisyah, S.Pd.', 'nip', NULL, 'jabatan', 'Guru IPS', 'kode_guru', 1),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'eti.anisyah@smpn8karawangbarat.sch.id', 'Eti Anisyah, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPS', 1)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Mardiyah, M.Pd. (Kode: 2)
  SELECT id INTO new_id FROM auth.users WHERE email = 'mardiyah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'mardiyah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Mardiyah, M.Pd.', 'nip', '19720725 200501 2 007', 'jabatan', 'PKS Kurikulum / Guru Matematika', 'kode_guru', 2),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'mardiyah@smpn8karawangbarat.sch.id', 'Mardiyah, M.Pd.', '19720725 200501 2 007', 'GURU'::public.user_role, 'PKS Kurikulum / Guru Matematika', 2)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Mimin Suherman, M.Pd. (Kode: 3)
  SELECT id INTO new_id FROM auth.users WHERE email = 'mimin.suherman@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'mimin.suherman@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Mimin Suherman, M.Pd.', 'nip', NULL, 'jabatan', 'Guru PJOK', 'kode_guru', 3),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'mimin.suherman@smpn8karawangbarat.sch.id', 'Mimin Suherman, M.Pd.', NULL, 'GURU'::public.user_role, 'Guru PJOK', 3)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Siti Barkah, S.Pd. (Kode: 4)
  SELECT id INTO new_id FROM auth.users WHERE email = 'siti.barkah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'siti.barkah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Siti Barkah, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Matematika', 'kode_guru', 4),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'siti.barkah@smpn8karawangbarat.sch.id', 'Siti Barkah, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Matematika', 4)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Santi Susanti, S.Pd. (Kode: 5)
  SELECT id INTO new_id FROM auth.users WHERE email = 'santi.susanti@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'santi.susanti@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Santi Susanti, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Inggris', 'kode_guru', 5),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'santi.susanti@smpn8karawangbarat.sch.id', 'Santi Susanti, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Inggris', 5)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Setiadi Purnomo, S.Pd. (Kode: 6)
  SELECT id INTO new_id FROM auth.users WHERE email = 'setiadi.purnomo@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'setiadi.purnomo@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Setiadi Purnomo, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Indonesia', 'kode_guru', 6),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'setiadi.purnomo@smpn8karawangbarat.sch.id', 'Setiadi Purnomo, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Indonesia', 6)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Ulfah Nurul Hikmawati, S.Pd. (Kode: 7)
  SELECT id INTO new_id FROM auth.users WHERE email = 'ulfah.nurul@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'ulfah.nurul@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Ulfah Nurul Hikmawati, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Sunda', 'kode_guru', 7),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'ulfah.nurul@smpn8karawangbarat.sch.id', 'Ulfah Nurul Hikmawati, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Sunda', 7)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Renita Dean Sari, S.Pd. (Kode: 8)
  SELECT id INTO new_id FROM auth.users WHERE email = 'renita.dean@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'renita.dean@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Renita Dean Sari, S.Pd.', 'nip', NULL, 'jabatan', 'Guru PPKn', 'kode_guru', 8),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'renita.dean@smpn8karawangbarat.sch.id', 'Renita Dean Sari, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru PPKn', 8)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Niken Norma Yunita, S.Pd. (Kode: 9)
  SELECT id INTO new_id FROM auth.users WHERE email = 'niken.norma@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'niken.norma@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Niken Norma Yunita, S.Pd.', 'nip', NULL, 'jabatan', 'Guru PJOK', 'kode_guru', 9),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'niken.norma@smpn8karawangbarat.sch.id', 'Niken Norma Yunita, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru PJOK', 9)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Ahmad Husen Multiana, S.Pd. (Kode: 10)
  SELECT id INTO new_id FROM auth.users WHERE email = 'ahmad.husen@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'ahmad.husen@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Ahmad Husen Multiana, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Inggris', 'kode_guru', 10),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'ahmad.husen@smpn8karawangbarat.sch.id', 'Ahmad Husen Multiana, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Inggris', 10)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Desty Nurbaety, S.Pd. (Kode: 11)
  SELECT id INTO new_id FROM auth.users WHERE email = 'desty.nurbaety@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'desty.nurbaety@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Desty Nurbaety, S.Pd.', 'nip', NULL, 'jabatan', 'Guru IPA', 'kode_guru', 11),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'desty.nurbaety@smpn8karawangbarat.sch.id', 'Desty Nurbaety, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPA', 11)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Wahyudin, S.E., S.Pd.I (Kode: 12)
  SELECT id INTO new_id FROM auth.users WHERE email = 'wahyudin@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'wahyudin@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Wahyudin, S.E., S.Pd.I', 'nip', NULL, 'jabatan', 'Guru Seni Budaya (SBK)', 'kode_guru', 12),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'wahyudin@smpn8karawangbarat.sch.id', 'Wahyudin, S.E., S.Pd.I', NULL, 'GURU'::public.user_role, 'Guru Seni Budaya (SBK)', 12)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Mimin Aminah, S.Ag. (Kode: 13)
  SELECT id INTO new_id FROM auth.users WHERE email = 'mimin.aminah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'mimin.aminah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Mimin Aminah, S.Ag.', 'nip', NULL, 'jabatan', 'Guru PAI', 'kode_guru', 13),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'mimin.aminah@smpn8karawangbarat.sch.id', 'Mimin Aminah, S.Ag.', NULL, 'GURU'::public.user_role, 'Guru PAI', 13)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Elva Mariana, S.Pd. (Kode: 14)
  SELECT id INTO new_id FROM auth.users WHERE email = 'elva.mariana@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'elva.mariana@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Elva Mariana, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Inggris', 'kode_guru', 14),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'elva.mariana@smpn8karawangbarat.sch.id', 'Elva Mariana, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Inggris', 14)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Dede Sumarna, S.Kom. (Kode: 15)
  SELECT id INTO new_id FROM auth.users WHERE email = 'dede.sumarna@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'dede.sumarna@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Dede Sumarna, S.Kom.', 'nip', NULL, 'jabatan', 'Guru Informatika (TIK)', 'kode_guru', 15),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'dede.sumarna@smpn8karawangbarat.sch.id', 'Dede Sumarna, S.Kom.', NULL, 'GURU'::public.user_role, 'Guru Informatika (TIK)', 15)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Umaya Habibah, S.E. (Kode: 16)
  SELECT id INTO new_id FROM auth.users WHERE email = 'umaya.habibah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'umaya.habibah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Umaya Habibah, S.E.', 'nip', NULL, 'jabatan', 'Guru IPS', 'kode_guru', 16),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'umaya.habibah@smpn8karawangbarat.sch.id', 'Umaya Habibah, S.E.', NULL, 'GURU'::public.user_role, 'Guru IPS', 16)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Siti Mustikah, S.Pd. (Kode: 17)
  SELECT id INTO new_id FROM auth.users WHERE email = 'siti.mustikah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'siti.mustikah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Siti Mustikah, S.Pd.', 'nip', NULL, 'jabatan', 'Guru PPKn', 'kode_guru', 17),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'siti.mustikah@smpn8karawangbarat.sch.id', 'Siti Mustikah, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru PPKn', 17)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Awaliatush Sholihah, S.Pd. (Kode: 18)
  SELECT id INTO new_id FROM auth.users WHERE email = 'awaliatush.sholihah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'awaliatush.sholihah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Awaliatush Sholihah, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Matematika', 'kode_guru', 18),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'awaliatush.sholihah@smpn8karawangbarat.sch.id', 'Awaliatush Sholihah, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Matematika', 18)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Khossol Jawad, S.Pd. (Kode: 19)
  SELECT id INTO new_id FROM auth.users WHERE email = 'khossol.jawad@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'khossol.jawad@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Khossol Jawad, S.Pd.', 'nip', NULL, 'jabatan', 'Guru IPA', 'kode_guru', 19),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'khossol.jawad@smpn8karawangbarat.sch.id', 'Khossol Jawad, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPA', 19)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Rosemalyna Khatimah, S.Pd. (Kode: 20)
  SELECT id INTO new_id FROM auth.users WHERE email = 'rosemalyna.khatimah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'rosemalyna.khatimah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Rosemalyna Khatimah, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Indonesia', 'kode_guru', 20),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'rosemalyna.khatimah@smpn8karawangbarat.sch.id', 'Rosemalyna Khatimah, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Indonesia', 20)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Nova Indriana, S.Pd. (Kode: 21)
  SELECT id INTO new_id FROM auth.users WHERE email = 'nova.indriana@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'nova.indriana@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Nova Indriana, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Indonesia', 'kode_guru', 21),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'nova.indriana@smpn8karawangbarat.sch.id', 'Nova Indriana, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Indonesia', 21)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Sri Dewi Hardayani, S.Pd. (Kode: 22)
  SELECT id INTO new_id FROM auth.users WHERE email = 'sri.dewi@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'sri.dewi@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Sri Dewi Hardayani, S.Pd.', 'nip', NULL, 'jabatan', 'Guru SBK & Bahasa Sunda', 'kode_guru', 22),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'sri.dewi@smpn8karawangbarat.sch.id', 'Sri Dewi Hardayani, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru SBK & Bahasa Sunda', 22)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Maya Hardini, S.Pd. (Kode: 23)
  SELECT id INTO new_id FROM auth.users WHERE email = 'maya.hardini@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'maya.hardini@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Maya Hardini, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Indonesia', 'kode_guru', 23),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'maya.hardini@smpn8karawangbarat.sch.id', 'Maya Hardini, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Indonesia', 23)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Mirani Kartini, S.Pd. (Kode: 24)
  SELECT id INTO new_id FROM auth.users WHERE email = 'mirani.kartini@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'mirani.kartini@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Mirani Kartini, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Matematika', 'kode_guru', 24),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'mirani.kartini@smpn8karawangbarat.sch.id', 'Mirani Kartini, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Matematika', 24)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Siti Nurjamilah, S.Pd.I (Kode: 25)
  SELECT id INTO new_id FROM auth.users WHERE email = 'siti.nurjamilah@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'siti.nurjamilah@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Siti Nurjamilah, S.Pd.I', 'nip', NULL, 'jabatan', 'Guru PAI', 'kode_guru', 25),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'siti.nurjamilah@smpn8karawangbarat.sch.id', 'Siti Nurjamilah, S.Pd.I', NULL, 'GURU'::public.user_role, 'Guru PAI', 25)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Damanhuri, S.Pd.I., M.Pd. (Kode: 26)
  SELECT id INTO new_id FROM auth.users WHERE email = 'damanhuri@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'damanhuri@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Damanhuri, S.Pd.I., M.Pd.', 'nip', NULL, 'jabatan', 'Guru PAI & TIK', 'kode_guru', 26),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'damanhuri@smpn8karawangbarat.sch.id', 'Damanhuri, S.Pd.I., M.Pd.', NULL, 'GURU'::public.user_role, 'Guru PAI & TIK', 26)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Siska Nurnianti, S.Pd. (Kode: 27)
  SELECT id INTO new_id FROM auth.users WHERE email = 'siska.nurnianti@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'siska.nurnianti@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Siska Nurnianti, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bahasa Inggris & SBK', 'kode_guru', 27),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'siska.nurnianti@smpn8karawangbarat.sch.id', 'Siska Nurnianti, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bahasa Inggris & SBK', 27)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Iwan Irnawan, S.Pd. (Kode: 28)
  SELECT id INTO new_id FROM auth.users WHERE email = 'iwan.irnawan@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'iwan.irnawan@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Iwan Irnawan, S.Pd.', 'nip', NULL, 'jabatan', 'Guru IPA', 'kode_guru', 28),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'iwan.irnawan@smpn8karawangbarat.sch.id', 'Iwan Irnawan, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPA', 28)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Dede Supriyanto, S.Pd. (Kode: 29)
  SELECT id INTO new_id FROM auth.users WHERE email = 'dede.supriyanto@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'dede.supriyanto@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Dede Supriyanto, S.Pd.', 'nip', NULL, 'jabatan', 'Guru IPA', 'kode_guru', 29),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'dede.supriyanto@smpn8karawangbarat.sch.id', 'Dede Supriyanto, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPA', 29)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Qurotul Aini, S.Pd., M.Pd. (Kode: 30)
  SELECT id INTO new_id FROM auth.users WHERE email = 'qurotul.aini@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'qurotul.aini@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Qurotul Aini, S.Pd., M.Pd.', 'nip', NULL, 'jabatan', 'Guru IPS', 'kode_guru', 30),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'qurotul.aini@smpn8karawangbarat.sch.id', 'Qurotul Aini, S.Pd., M.Pd.', NULL, 'GURU'::public.user_role, 'Guru IPS', 30)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Muhamad Nurseha, S.Pd. (Kode: 31)
  SELECT id INTO new_id FROM auth.users WHERE email = 'muhamad.nurseha@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'muhamad.nurseha@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Muhamad Nurseha, S.Pd.', 'nip', NULL, 'jabatan', 'Guru Bimbingan Konseling (BK)', 'kode_guru', 31),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'muhamad.nurseha@smpn8karawangbarat.sch.id', 'Muhamad Nurseha, S.Pd.', NULL, 'GURU'::public.user_role, 'Guru Bimbingan Konseling (BK)', 31)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Mamay Abdullah, S.Pd., M.Pd. (Kode: 99)
  SELECT id INTO new_id FROM auth.users WHERE email = 'kepsek@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'kepsek@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'ADMIN', 'nama', 'Mamay Abdullah, S.Pd., M.Pd.', 'nip', '19700724 199802 1 003', 'jabatan', 'Kepala Sekolah', 'kode_guru', 99),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'kepsek@smpn8karawangbarat.sch.id', 'Mamay Abdullah, S.Pd., M.Pd.', '19700724 199802 1 003', 'ADMIN'::public.user_role, 'Kepala Sekolah', 99)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Ana (Kode: 101)
  SELECT id INTO new_id FROM auth.users WHERE email = 'ana@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'ana@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Ana', 'nip', NULL, 'jabatan', 'Tenaga Kependidikan / Petugas Piket', 'kode_guru', 101),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'ana@smpn8karawangbarat.sch.id', 'Ana', NULL, 'GURU'::public.user_role, 'Tenaga Kependidikan / Petugas Piket', 101)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Imi Suminar (Kode: 102)
  SELECT id INTO new_id FROM auth.users WHERE email = 'imi.suminar@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'imi.suminar@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Imi Suminar', 'nip', NULL, 'jabatan', 'Tenaga Kependidikan / Petugas Piket', 'kode_guru', 102),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'imi.suminar@smpn8karawangbarat.sch.id', 'Imi Suminar', NULL, 'GURU'::public.user_role, 'Tenaga Kependidikan / Petugas Piket', 102)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;


  -- Akun: Hanni Apnianti (Kode: 103)
  SELECT id INTO new_id FROM auth.users WHERE email = 'hanni.apnianti@smpn8karawangbarat.sch.id';
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'hanni.apnianti@smpn8karawangbarat.sch.id',
      crypt('guru123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'GURU', 'nama', 'Hanni Apnianti', 'nip', NULL, 'jabatan', 'Tenaga Kependidikan / Petugas Piket', 'kode_guru', 103),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (id, email, nama, nip, role, jabatan, kode_guru)
  VALUES (new_id, 'hanni.apnianti@smpn8karawangbarat.sch.id', 'Hanni Apnianti', NULL, 'GURU'::public.user_role, 'Tenaga Kependidikan / Petugas Piket', 103)
  ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    nip = EXCLUDED.nip,
    role = EXCLUDED.role,
    jabatan = EXCLUDED.jabatan,
    kode_guru = EXCLUDED.kode_guru;

END $$;

-- 3. SEED 12 MATA PELAJARAN
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Pendidikan Agama Islam & Budi Pekerti', 'PAIBP-A')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Pendidikan Pancasila & Kewarganegaraan', 'PPKN-B')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Bahasa Indonesia', 'BIND-C')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Matematika', 'MTK-D')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Ilmu Pengetahuan Alam', 'IPA-E')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Ilmu Pengetahuan Sosial', 'IPS-F')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Bahasa Inggris', 'BING-G')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Seni Budaya & Keterampilan', 'SBK-H')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Pendidikan Jasmani, Olahraga, & Kesehatan', 'PJOK-I')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Teknologi Informasi & Komunikasi / Informatika', 'TIK-J')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Bahasa Sunda', 'BSUN-K')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;
INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES ('Bimbingan & Konseling', 'BK-L')
ON CONFLICT (kode_mapel) DO UPDATE SET nama_mapel = EXCLUDED.nama_mapel;

-- 4. SEED 23 RUANG KELAS / ROMBEL & PENETAPAN WALI KELAS

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7A',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7A TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7A',
  (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7B',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7B TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7B',
  (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7C',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7C TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7C',
  (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7D',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7D TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7D',
  (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7E',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7E TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7E',
  (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7F',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7F TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7F',
  (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 7G',
  'Gedung Kelas VII',
  'Ruang Belajar Ruang Kelas 7G TP 2026/2027',
  'VII',
  'QR-RUANG-KLS7G',
  (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8A',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8A TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8A',
  (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8B',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8B TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8B',
  (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8C',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8C TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8C',
  (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8D',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8D TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8D',
  (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8E',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8E TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8E',
  (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 8F',
  'Gedung Kelas VIII',
  'Ruang Belajar Ruang Kelas 8F TP 2026/2027',
  'VIII',
  'QR-RUANG-KLS8F',
  (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9A',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9A TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9A',
  (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9B',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9B TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9B',
  (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9C',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9C TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9C',
  (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9D',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9D TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9D',
  (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9E',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9E TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9E',
  (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9F',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9F TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9F',
  (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9G',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9G TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9G',
  (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9H',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9H TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9H',
  (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9I',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9I TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9I',
  (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

INSERT INTO public.rooms (nama_ruangan, gedung, deskripsi, tingkat, kode_qr, wali_kelas_id)
VALUES (
  'Ruang Kelas 9J',
  'Gedung Kelas IX',
  'Ruang Belajar Ruang Kelas 9J TP 2026/2027',
  'IX',
  'QR-RUANG-KLS9J',
  (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1)
)
ON CONFLICT (nama_ruangan) DO UPDATE SET
  tingkat = EXCLUDED.tingkat,
  wali_kelas_id = EXCLUDED.wali_kelas_id;

-- 5. SEED JADWAL PIKET GURU

INSERT INTO public.picket_schedules (hari, teacher_id, nama_petugas, catatan)
VALUES (
  'Senin',
  (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
  'Ahmad Husen Multiana, S.Pd.',
  'Petugas Piket Hari Senin'
)
ON CONFLICT (hari, teacher_id) DO UPDATE SET
  nama_petugas = EXCLUDED.nama_petugas,
  catatan = EXCLUDED.catatan;

INSERT INTO public.picket_schedules (hari, teacher_id, nama_petugas, catatan)
VALUES (
  'Selasa',
  (SELECT id FROM public.profiles WHERE kode_guru = 101 LIMIT 1),
  'Ana',
  'Petugas Piket Hari Selasa'
)
ON CONFLICT (hari, teacher_id) DO UPDATE SET
  nama_petugas = EXCLUDED.nama_petugas,
  catatan = EXCLUDED.catatan;

INSERT INTO public.picket_schedules (hari, teacher_id, nama_petugas, catatan)
VALUES (
  'Rabu',
  (SELECT id FROM public.profiles WHERE kode_guru = 102 LIMIT 1),
  'Imi Suminar',
  'Petugas Piket Hari Rabu'
)
ON CONFLICT (hari, teacher_id) DO UPDATE SET
  nama_petugas = EXCLUDED.nama_petugas,
  catatan = EXCLUDED.catatan;

INSERT INTO public.picket_schedules (hari, teacher_id, nama_petugas, catatan)
VALUES (
  'Kamis',
  (SELECT id FROM public.profiles WHERE kode_guru = 103 LIMIT 1),
  'Hanni Apnianti',
  'Petugas Piket Hari Kamis'
)
ON CONFLICT (hari, teacher_id) DO UPDATE SET
  nama_petugas = EXCLUDED.nama_petugas,
  catatan = EXCLUDED.catatan;

INSERT INTO public.picket_schedules (hari, teacher_id, nama_petugas, catatan)
VALUES (
  'Jumat',
  (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
  'Damanhuri, S.Pd.I., M.Pd.',
  'Petugas Piket Hari Jumat'
)
ON CONFLICT (hari, teacher_id) DO UPDATE SET
  nama_petugas = EXCLUDED.nama_petugas,
  catatan = EXCLUDED.catatan;

-- 6. SEED SELURUH JADWAL PELAJARAN KBM (391 Sesi)
-- Membersihkan jadwal lama untuk sinkronisasi bersih:
DELETE FROM public.schedules;

INSERT INTO public.schedules (teacher_id, subject_id, room_id, hari, jam_mulai, jam_selesai, jam_ke)
VALUES
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Senin',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Senin',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Senin',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Senin',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Senin',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Senin',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Senin',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Senin',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Selasa',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:10:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Selasa',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Selasa',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Selasa',
    '08:50:00',
    '10:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Selasa',
    '10:30:00',
    '11:50:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Selasa',
    '07:30:00',
    '09:30:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Selasa',
    '09:50:00',
    '11:50:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Selasa',
    '12:30:00',
    '13:50:00',
    '7-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Selasa',
    '07:30:00',
    '08:50:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Selasa',
    '08:50:00',
    '11:10:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Selasa',
    '11:10:00',
    '13:50:00',
    '6-8'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Rabu',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Rabu',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Rabu',
    '08:20:00',
    '10:40:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Rabu',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Rabu',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Rabu',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Rabu',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Rabu',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Rabu',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Rabu',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Rabu',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Rabu',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Rabu',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Rabu',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Kamis',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Kamis',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Kamis',
    '08:20:00',
    '10:40:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Kamis',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Kamis',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Kamis',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Kamis',
    '10:00:00',
    '12:00:00',
    '5-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Kamis',
    '08:20:00',
    '10:40:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Kamis',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Kamis',
    '08:20:00',
    '10:40:00',
    '3-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Kamis',
    '09:00:00',
    '10:40:00',
    '4-5'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Kamis',
    '10:40:00',
    '12:00:00',
    '6-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Kamis',
    '10:00:00',
    '11:20:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Kamis',
    '07:00:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Kamis',
    '09:00:00',
    '11:20:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Kamis',
    '11:20:00',
    '14:00:00',
    '7-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Kamis',
    '07:00:00',
    '08:20:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Kamis',
    '08:20:00',
    '09:40:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Kamis',
    '10:00:00',
    '12:00:00',
    '5-7'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Kamis',
    '12:40:00',
    '14:00:00',
    '8-9'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 28 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 25 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 6 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 22 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 26 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 14 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 16 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 24 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 9 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 23 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 17 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 18 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 27 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 19 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 8 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PPKN-B' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 29 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 21 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 4 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 7 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BSUN-K' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 3 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PJOK-I' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 13 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'PAIBP-A' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 15 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'TIK-J' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 5 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 1 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 20 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BIND-C' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 2 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'MTK-D' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 10 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BING-G' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Jumat',
    '07:30:00',
    '08:30:00',
    '1-2'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 30 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPS-F' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Jumat',
    '08:30:00',
    '09:30:00',
    '3-4'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Jumat',
    '10:00:00',
    '11:00:00',
    '5-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 11 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'IPA-E' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Jumat',
    '07:30:00',
    '09:00:00',
    '1-3'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 12 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'SBK-H' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Jumat',
    '09:00:00',
    '11:00:00',
    '4-6'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7A' LIMIT 1),
    'Senin',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7B' LIMIT 1),
    'Senin',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7C' LIMIT 1),
    'Senin',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7D' LIMIT 1),
    'Senin',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7E' LIMIT 1),
    'Selasa',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7F' LIMIT 1),
    'Selasa',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 7G' LIMIT 1),
    'Selasa',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8A' LIMIT 1),
    'Selasa',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8B' LIMIT 1),
    'Selasa',
    '13:50:00',
    '14:30:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8C' LIMIT 1),
    'Rabu',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8D' LIMIT 1),
    'Rabu',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8E' LIMIT 1),
    'Rabu',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 8F' LIMIT 1),
    'Rabu',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9A' LIMIT 1),
    'Rabu',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9B' LIMIT 1),
    'Kamis',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9C' LIMIT 1),
    'Kamis',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9D' LIMIT 1),
    'Kamis',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9E' LIMIT 1),
    'Kamis',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9F' LIMIT 1),
    'Kamis',
    '14:00:00',
    '14:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9G' LIMIT 1),
    'Jumat',
    '11:00:00',
    '11:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9H' LIMIT 1),
    'Jumat',
    '11:00:00',
    '11:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9I' LIMIT 1),
    'Jumat',
    '11:00:00',
    '11:40:00',
    'BK'
  ),
  (
    (SELECT id FROM public.profiles WHERE kode_guru = 31 LIMIT 1),
    (SELECT id FROM public.subjects WHERE kode_mapel = 'BK-L' LIMIT 1),
    (SELECT id FROM public.rooms WHERE nama_ruangan = 'Ruang Kelas 9J' LIMIT 1),
    'Jumat',
    '11:00:00',
    '11:40:00',
    'BK'
  );

-- 7. VERIFIKASI SEED DATA
SELECT 'Total Guru' AS entitas, COUNT(*) AS jumlah FROM public.profiles WHERE role = 'GURU'
UNION ALL SELECT 'Total Ruang Kelas', COUNT(*) FROM public.rooms
UNION ALL SELECT 'Total Mata Pelajaran', COUNT(*) FROM public.subjects
UNION ALL SELECT 'Total Jadwal KBM', COUNT(*) FROM public.schedules
UNION ALL SELECT 'Total Jadwal Piket', COUNT(*) FROM public.picket_schedules;