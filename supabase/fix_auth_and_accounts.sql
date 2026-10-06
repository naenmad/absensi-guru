-- ====================================================================
-- FIX: LENGKAPI AKUN AUTH SUPABASE & ATASI 'Database error querying schema'
-- Jalankan skrip ini langsung di Supabase SQL Editor (1x RUN)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Perbaiki semua nilai NULL pada kolom token auth.users agar GoTrue tidak crash
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- 2. Matikan trigger sinkronisasi profil sementara agar tidak terjadi konflik
ALTER TABLE auth.users DISABLE TRIGGER ALL;

DO $$
DECLARE
  pwd_admin text := crypt('admin123', gen_salt('bf'));
  pwd_guru  text := crypt('guru123', gen_salt('bf'));
BEGIN

  -- Akun: 1 (1@sekolah.com)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = '1@sekolah.com') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', '1',
        'full_name', '1',
        'nip', '1',
        'jabatan', '1'
      )
    WHERE email = '1@sekolah.com';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'f5850b76-0aec-4b22-8b60-f2540cdda169',
      '00000000-0000-0000-0000-000000000000',
      '1@sekolah.com',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', '1',
        'full_name', '1',
        'nip', '1',
        'jabatan', '1'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Administrator Sekolah (admin@sekolah.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sekolah.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_admin,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'ADMIN',
        'nama', 'Administrator Sekolah',
        'full_name', 'Administrator Sekolah',
        'nip', '',
        'jabatan', 'Guru'
      )
    WHERE email = 'admin@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '420483ff-3c4c-46e1-a9f3-3524efd53aef',
      '00000000-0000-0000-0000-000000000000',
      'admin@sekolah.sch.id',
      pwd_admin,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'ADMIN',
        'nama', 'Administrator Sekolah',
        'full_name', 'Administrator Sekolah',
        'nip', '',
        'jabatan', 'Guru'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Ahmad Husen Multiana, S.Pd. (ahmad.husen@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ahmad.husen@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ahmad Husen Multiana, S.Pd.',
        'full_name', 'Ahmad Husen Multiana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      )
    WHERE email = 'ahmad.husen@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'ac71ad3f-508e-4c3e-ab74-6e0dd48b5942',
      '00000000-0000-0000-0000-000000000000',
      'ahmad.husen@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ahmad Husen Multiana, S.Pd.',
        'full_name', 'Ahmad Husen Multiana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Ahmad Zulkarnaen, S.Kom. (naen@mail.com)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'naen@mail.com') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ahmad Zulkarnaen, S.Kom.',
        'full_name', 'Ahmad Zulkarnaen, S.Kom.',
        'nip', '6969',
        'jabatan', 'Guru TIK'
      )
    WHERE email = 'naen@mail.com';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'c2976983-3ebf-4781-bf0d-69f1cf75afcf',
      '00000000-0000-0000-0000-000000000000',
      'naen@mail.com',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ahmad Zulkarnaen, S.Kom.',
        'full_name', 'Ahmad Zulkarnaen, S.Kom.',
        'nip', '6969',
        'jabatan', 'Guru TIK'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Ana (ana@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ana@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ana',
        'full_name', 'Ana',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      )
    WHERE email = 'ana@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '216dd541-8791-407a-bbb4-7b3c8ec6e75c',
      '00000000-0000-0000-0000-000000000000',
      'ana@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ana',
        'full_name', 'Ana',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Awaliatush Sholihah, S.Pd. (awaliatush.sholihah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'awaliatush.sholihah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Awaliatush Sholihah, S.Pd.',
        'full_name', 'Awaliatush Sholihah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      )
    WHERE email = 'awaliatush.sholihah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'c408bb17-1cb8-4f3b-8f23-242285d9ea2b',
      '00000000-0000-0000-0000-000000000000',
      'awaliatush.sholihah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Awaliatush Sholihah, S.Pd.',
        'full_name', 'Awaliatush Sholihah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Budi Santoso, S.Pd. (guru@sekolah.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'guru@sekolah.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Budi Santoso, S.Pd.',
        'full_name', 'Budi Santoso, S.Pd.',
        'nip', '198501012010011001',
        'jabatan', 'Guru Matematika'
      )
    WHERE email = 'guru@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '011c79e5-d7bf-4394-b2cb-41bed7e9d4ed',
      '00000000-0000-0000-0000-000000000000',
      'guru@sekolah.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Budi Santoso, S.Pd.',
        'full_name', 'Budi Santoso, S.Pd.',
        'nip', '198501012010011001',
        'jabatan', 'Guru Matematika'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Damanhuri, S.Pd.I., M.Pd. (damanhuri@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'damanhuri@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Damanhuri, S.Pd.I., M.Pd.',
        'full_name', 'Damanhuri, S.Pd.I., M.Pd.',
        'nip', '',
        'jabatan', 'Guru PAI & TIK'
      )
    WHERE email = 'damanhuri@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'a4a9f162-4953-47f3-80f8-bf8390e48d8d',
      '00000000-0000-0000-0000-000000000000',
      'damanhuri@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Damanhuri, S.Pd.I., M.Pd.',
        'full_name', 'Damanhuri, S.Pd.I., M.Pd.',
        'nip', '',
        'jabatan', 'Guru PAI & TIK'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Dede Sumarna, S.Kom. (dede.sumarna@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'dede.sumarna@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Dede Sumarna, S.Kom.',
        'full_name', 'Dede Sumarna, S.Kom.',
        'nip', '',
        'jabatan', 'Guru Informatika (TIK)'
      )
    WHERE email = 'dede.sumarna@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '06faabfc-b2d5-4806-aaba-ff5ccb1c743a',
      '00000000-0000-0000-0000-000000000000',
      'dede.sumarna@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Dede Sumarna, S.Kom.',
        'full_name', 'Dede Sumarna, S.Kom.',
        'nip', '',
        'jabatan', 'Guru Informatika (TIK)'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Dede Supriyanto, S.Pd. (dede.supriyanto@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'dede.supriyanto@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Dede Supriyanto, S.Pd.',
        'full_name', 'Dede Supriyanto, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      )
    WHERE email = 'dede.supriyanto@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '6561177a-22c3-4152-9b88-7b9c32c36a16',
      '00000000-0000-0000-0000-000000000000',
      'dede.supriyanto@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Dede Supriyanto, S.Pd.',
        'full_name', 'Dede Supriyanto, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Desty Nurbaety, S.Pd. (desty.nurbaety@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'desty.nurbaety@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Desty Nurbaety, S.Pd.',
        'full_name', 'Desty Nurbaety, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      )
    WHERE email = 'desty.nurbaety@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'f7edcf23-e0c4-49d7-bd98-6e5c2a7a308c',
      '00000000-0000-0000-0000-000000000000',
      'desty.nurbaety@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Desty Nurbaety, S.Pd.',
        'full_name', 'Desty Nurbaety, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Elva Mariana, S.Pd. (elva.mariana@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'elva.mariana@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Elva Mariana, S.Pd.',
        'full_name', 'Elva Mariana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      )
    WHERE email = 'elva.mariana@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '50af730f-cbe7-4fea-93da-95baf402fa86',
      '00000000-0000-0000-0000-000000000000',
      'elva.mariana@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Elva Mariana, S.Pd.',
        'full_name', 'Elva Mariana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Eti Anisyah, S.Pd. (eti.anisyah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'eti.anisyah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Eti Anisyah, S.Pd.',
        'full_name', 'Eti Anisyah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPS'
      )
    WHERE email = 'eti.anisyah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '959e4ea0-f2c3-4872-94c2-6ebebed7fb57',
      '00000000-0000-0000-0000-000000000000',
      'eti.anisyah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Eti Anisyah, S.Pd.',
        'full_name', 'Eti Anisyah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPS'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Hanni Apnianti (hanni.apnianti@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'hanni.apnianti@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Hanni Apnianti',
        'full_name', 'Hanni Apnianti',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      )
    WHERE email = 'hanni.apnianti@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '87125378-52a7-476b-afb8-f8cfb8ab5695',
      '00000000-0000-0000-0000-000000000000',
      'hanni.apnianti@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Hanni Apnianti',
        'full_name', 'Hanni Apnianti',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Imi Suminar (imi.suminar@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'imi.suminar@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Imi Suminar',
        'full_name', 'Imi Suminar',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      )
    WHERE email = 'imi.suminar@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'd2e4c1fb-f057-48bf-9ac7-bc013f365b84',
      '00000000-0000-0000-0000-000000000000',
      'imi.suminar@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Imi Suminar',
        'full_name', 'Imi Suminar',
        'nip', '',
        'jabatan', 'Tenaga Kependidikan / Petugas Piket'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Iwan Irnawan, S.Pd. (iwan.irnawan@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'iwan.irnawan@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Iwan Irnawan, S.Pd.',
        'full_name', 'Iwan Irnawan, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      )
    WHERE email = 'iwan.irnawan@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'f42d111a-1923-4b97-9b4c-5d05e80d6cfa',
      '00000000-0000-0000-0000-000000000000',
      'iwan.irnawan@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Iwan Irnawan, S.Pd.',
        'full_name', 'Iwan Irnawan, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Khossol Jawad, S.Pd. (khossol.jawad@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'khossol.jawad@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Khossol Jawad, S.Pd.',
        'full_name', 'Khossol Jawad, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      )
    WHERE email = 'khossol.jawad@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'b6b73461-b3e3-41a7-8aec-1d0263aa0588',
      '00000000-0000-0000-0000-000000000000',
      'khossol.jawad@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Khossol Jawad, S.Pd.',
        'full_name', 'Khossol Jawad, S.Pd.',
        'nip', '',
        'jabatan', 'Guru IPA'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Mamay Abdullah, S.Pd., M.Pd. (kepsek@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'kepsek@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'ADMIN',
        'nama', 'Mamay Abdullah, S.Pd., M.Pd.',
        'full_name', 'Mamay Abdullah, S.Pd., M.Pd.',
        'nip', '19700724 199802 1 003',
        'jabatan', 'Kepala Sekolah'
      )
    WHERE email = 'kepsek@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '0b84ea10-c11e-4e90-be7a-ac190573af91',
      '00000000-0000-0000-0000-000000000000',
      'kepsek@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'ADMIN',
        'nama', 'Mamay Abdullah, S.Pd., M.Pd.',
        'full_name', 'Mamay Abdullah, S.Pd., M.Pd.',
        'nip', '19700724 199802 1 003',
        'jabatan', 'Kepala Sekolah'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Mardiyah, M.Pd. (mardiyah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mardiyah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mardiyah, M.Pd.',
        'full_name', 'Mardiyah, M.Pd.',
        'nip', '19720725 200501 2 007',
        'jabatan', 'PKS Kurikulum / Guru Matematika'
      )
    WHERE email = 'mardiyah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'ec2c35b5-25e3-4c16-8bcb-e3282e4bfc3b',
      '00000000-0000-0000-0000-000000000000',
      'mardiyah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mardiyah, M.Pd.',
        'full_name', 'Mardiyah, M.Pd.',
        'nip', '19720725 200501 2 007',
        'jabatan', 'PKS Kurikulum / Guru Matematika'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Maya Hardini, S.Pd. (maya.hardini@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'maya.hardini@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Maya Hardini, S.Pd.',
        'full_name', 'Maya Hardini, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      )
    WHERE email = 'maya.hardini@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '43b9c651-79ba-4222-a023-e6485a95aaed',
      '00000000-0000-0000-0000-000000000000',
      'maya.hardini@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Maya Hardini, S.Pd.',
        'full_name', 'Maya Hardini, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Mimin Aminah, S.Ag. (mimin.aminah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mimin.aminah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mimin Aminah, S.Ag.',
        'full_name', 'Mimin Aminah, S.Ag.',
        'nip', '',
        'jabatan', 'Guru PAI'
      )
    WHERE email = 'mimin.aminah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '59eacce2-a94f-4010-a04d-818f7d849d0c',
      '00000000-0000-0000-0000-000000000000',
      'mimin.aminah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mimin Aminah, S.Ag.',
        'full_name', 'Mimin Aminah, S.Ag.',
        'nip', '',
        'jabatan', 'Guru PAI'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Mimin Suherman, M.Pd. (mimin.suherman@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mimin.suherman@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mimin Suherman, M.Pd.',
        'full_name', 'Mimin Suherman, M.Pd.',
        'nip', '',
        'jabatan', 'Guru PJOK'
      )
    WHERE email = 'mimin.suherman@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '0e1d54ed-3245-46d4-bc2b-5c26d3e26396',
      '00000000-0000-0000-0000-000000000000',
      'mimin.suherman@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mimin Suherman, M.Pd.',
        'full_name', 'Mimin Suherman, M.Pd.',
        'nip', '',
        'jabatan', 'Guru PJOK'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Mirani Kartini, S.Pd. (mirani.kartini@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mirani.kartini@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mirani Kartini, S.Pd.',
        'full_name', 'Mirani Kartini, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      )
    WHERE email = 'mirani.kartini@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '9c3b4483-7cf1-42c3-98d6-c179816f2319',
      '00000000-0000-0000-0000-000000000000',
      'mirani.kartini@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Mirani Kartini, S.Pd.',
        'full_name', 'Mirani Kartini, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Muhamad Nurseha, S.Pd. (muhamad.nurseha@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'muhamad.nurseha@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Muhamad Nurseha, S.Pd.',
        'full_name', 'Muhamad Nurseha, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bimbingan Konseling (BK)'
      )
    WHERE email = 'muhamad.nurseha@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'a0199799-0738-4f90-ac0e-75b42205857e',
      '00000000-0000-0000-0000-000000000000',
      'muhamad.nurseha@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Muhamad Nurseha, S.Pd.',
        'full_name', 'Muhamad Nurseha, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bimbingan Konseling (BK)'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Niken Norma Yunita, S.Pd. (niken.norma@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'niken.norma@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Niken Norma Yunita, S.Pd.',
        'full_name', 'Niken Norma Yunita, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PJOK'
      )
    WHERE email = 'niken.norma@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '13c39faa-f261-46f6-83cb-c38120a00083',
      '00000000-0000-0000-0000-000000000000',
      'niken.norma@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Niken Norma Yunita, S.Pd.',
        'full_name', 'Niken Norma Yunita, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PJOK'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Nova Indriana, S.Pd. (nova.indriana@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'nova.indriana@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Nova Indriana, S.Pd.',
        'full_name', 'Nova Indriana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      )
    WHERE email = 'nova.indriana@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '1da20207-8b3c-43c0-8425-d2058dcffd7a',
      '00000000-0000-0000-0000-000000000000',
      'nova.indriana@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Nova Indriana, S.Pd.',
        'full_name', 'Nova Indriana, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Qurotul Aini, S.Pd., M.Pd. (qurotul.aini@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'qurotul.aini@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Qurotul Aini, S.Pd., M.Pd.',
        'full_name', 'Qurotul Aini, S.Pd., M.Pd.',
        'nip', '',
        'jabatan', 'Guru IPS'
      )
    WHERE email = 'qurotul.aini@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '0c400a6f-97a7-400b-bfc3-6e4d37865e59',
      '00000000-0000-0000-0000-000000000000',
      'qurotul.aini@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Qurotul Aini, S.Pd., M.Pd.',
        'full_name', 'Qurotul Aini, S.Pd., M.Pd.',
        'nip', '',
        'jabatan', 'Guru IPS'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Renita Dean Sari, S.Pd. (renita.dean@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'renita.dean@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Renita Dean Sari, S.Pd.',
        'full_name', 'Renita Dean Sari, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PPKn'
      )
    WHERE email = 'renita.dean@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '010166e1-c160-45cd-bc47-a65b526abcab',
      '00000000-0000-0000-0000-000000000000',
      'renita.dean@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Renita Dean Sari, S.Pd.',
        'full_name', 'Renita Dean Sari, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PPKn'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Rosemalyna Khatimah, S.Pd. (rosemalyna.khatimah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'rosemalyna.khatimah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Rosemalyna Khatimah, S.Pd.',
        'full_name', 'Rosemalyna Khatimah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      )
    WHERE email = 'rosemalyna.khatimah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '54a2c980-d3e4-40ea-8860-986737386351',
      '00000000-0000-0000-0000-000000000000',
      'rosemalyna.khatimah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Rosemalyna Khatimah, S.Pd.',
        'full_name', 'Rosemalyna Khatimah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Santi Susanti, S.Pd. (santi.susanti@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'santi.susanti@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Santi Susanti, S.Pd.',
        'full_name', 'Santi Susanti, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      )
    WHERE email = 'santi.susanti@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '5d78e693-4fd4-4a84-a97b-ba6cbd8dd916',
      '00000000-0000-0000-0000-000000000000',
      'santi.susanti@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Santi Susanti, S.Pd.',
        'full_name', 'Santi Susanti, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Setiadi Purnomo, S.Pd. (setiadi.purnomo@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'setiadi.purnomo@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Setiadi Purnomo, S.Pd.',
        'full_name', 'Setiadi Purnomo, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      )
    WHERE email = 'setiadi.purnomo@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '29a03ba2-fe87-4b41-8b71-aff54c0ce2e6',
      '00000000-0000-0000-0000-000000000000',
      'setiadi.purnomo@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Setiadi Purnomo, S.Pd.',
        'full_name', 'Setiadi Purnomo, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Indonesia'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: shidqy (shidqy@test.com)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'shidqy@test.com') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'shidqy',
        'full_name', 'shidqy',
        'nip', '234324',
        'jabatan', 'guru kalian semua'
      )
    WHERE email = 'shidqy@test.com';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '26096b83-2b48-4d03-8212-7439381ad0bb',
      '00000000-0000-0000-0000-000000000000',
      'shidqy@test.com',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'shidqy',
        'full_name', 'shidqy',
        'nip', '234324',
        'jabatan', 'guru kalian semua'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Siska Nurnianti, S.Pd. (siska.nurnianti@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siska.nurnianti@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siska Nurnianti, S.Pd.',
        'full_name', 'Siska Nurnianti, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris & SBK'
      )
    WHERE email = 'siska.nurnianti@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'd49d7b78-7a1c-4dd9-af3f-222ec3196758',
      '00000000-0000-0000-0000-000000000000',
      'siska.nurnianti@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siska Nurnianti, S.Pd.',
        'full_name', 'Siska Nurnianti, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Inggris & SBK'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Siti Aminah, M.Pd. (siti@sekolah.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti@sekolah.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Aminah, M.Pd.',
        'full_name', 'Siti Aminah, M.Pd.',
        'nip', '198904122014032002',
        'jabatan', 'Guru Bahasa Indonesia'
      )
    WHERE email = 'siti@sekolah.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'de7e778e-78e6-488a-9d95-36cc70bc1535',
      '00000000-0000-0000-0000-000000000000',
      'siti@sekolah.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Aminah, M.Pd.',
        'full_name', 'Siti Aminah, M.Pd.',
        'nip', '198904122014032002',
        'jabatan', 'Guru Bahasa Indonesia'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Siti Barkah, S.Pd. (siti.barkah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti.barkah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Barkah, S.Pd.',
        'full_name', 'Siti Barkah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      )
    WHERE email = 'siti.barkah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'e3595fff-9d4d-4b12-8b4f-74c88b812137',
      '00000000-0000-0000-0000-000000000000',
      'siti.barkah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Barkah, S.Pd.',
        'full_name', 'Siti Barkah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Matematika'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Siti Mustikah, S.Pd. (siti.mustikah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti.mustikah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Mustikah, S.Pd.',
        'full_name', 'Siti Mustikah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PPKn'
      )
    WHERE email = 'siti.mustikah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '7ce63b7d-c04c-4da9-9746-1bd05ef8d7e2',
      '00000000-0000-0000-0000-000000000000',
      'siti.mustikah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Mustikah, S.Pd.',
        'full_name', 'Siti Mustikah, S.Pd.',
        'nip', '',
        'jabatan', 'Guru PPKn'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Siti Nurjamilah, S.Pd.I (siti.nurjamilah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti.nurjamilah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Nurjamilah, S.Pd.I',
        'full_name', 'Siti Nurjamilah, S.Pd.I',
        'nip', '',
        'jabatan', 'Guru PAI'
      )
    WHERE email = 'siti.nurjamilah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '1e4f389e-e05d-40b0-997d-867611d8627d',
      '00000000-0000-0000-0000-000000000000',
      'siti.nurjamilah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Siti Nurjamilah, S.Pd.I',
        'full_name', 'Siti Nurjamilah, S.Pd.I',
        'nip', '',
        'jabatan', 'Guru PAI'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Sri Dewi Hardayani, S.Pd. (sri.dewi@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'sri.dewi@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Sri Dewi Hardayani, S.Pd.',
        'full_name', 'Sri Dewi Hardayani, S.Pd.',
        'nip', '',
        'jabatan', 'Guru SBK & Bahasa Sunda'
      )
    WHERE email = 'sri.dewi@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'e1cbfb8c-7852-4125-afa6-f32669efecdc',
      '00000000-0000-0000-0000-000000000000',
      'sri.dewi@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Sri Dewi Hardayani, S.Pd.',
        'full_name', 'Sri Dewi Hardayani, S.Pd.',
        'nip', '',
        'jabatan', 'Guru SBK & Bahasa Sunda'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Ulfah Nurul Hikmawati, S.Pd. (ulfah.nurul@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ulfah.nurul@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ulfah Nurul Hikmawati, S.Pd.',
        'full_name', 'Ulfah Nurul Hikmawati, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Sunda'
      )
    WHERE email = 'ulfah.nurul@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      'f2c73cb4-9ea3-4e6d-a4b4-51a3258ec814',
      '00000000-0000-0000-0000-000000000000',
      'ulfah.nurul@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Ulfah Nurul Hikmawati, S.Pd.',
        'full_name', 'Ulfah Nurul Hikmawati, S.Pd.',
        'nip', '',
        'jabatan', 'Guru Bahasa Sunda'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Umaya Habibah, S.E. (umaya.habibah@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'umaya.habibah@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Umaya Habibah, S.E.',
        'full_name', 'Umaya Habibah, S.E.',
        'nip', '',
        'jabatan', 'Guru IPS'
      )
    WHERE email = 'umaya.habibah@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '117574e9-d0a1-4ecb-bd29-a02bfa4e8de8',
      '00000000-0000-0000-0000-000000000000',
      'umaya.habibah@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Umaya Habibah, S.E.',
        'full_name', 'Umaya Habibah, S.E.',
        'nip', '',
        'jabatan', 'Guru IPS'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Akun: Wahyudin, S.E., S.Pd.I (wahyudin@smpn8karawangbarat.sch.id)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'wahyudin@smpn8karawangbarat.sch.id') THEN
    UPDATE auth.users
    SET
      encrypted_password = pwd_guru,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change_token_current = '',
      email_change = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object(
        'role', 'GURU',
        'nama', 'Wahyudin, S.E., S.Pd.I',
        'full_name', 'Wahyudin, S.E., S.Pd.I',
        'nip', '',
        'jabatan', 'Guru Seni Budaya (SBK)'
      )
    WHERE email = 'wahyudin@smpn8karawangbarat.sch.id';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '354da160-7a27-436c-b35f-f64ad3b0c4a7',
      '00000000-0000-0000-0000-000000000000',
      'wahyudin@smpn8karawangbarat.sch.id',
      pwd_guru,
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'GURU',
        'nama', 'Wahyudin, S.E., S.Pd.I',
        'full_name', 'Wahyudin, S.E., S.Pd.I',
        'nip', '',
        'jabatan', 'Guru Seni Budaya (SBK)'
      ),
      NOW(), NOW(), 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

END $$;

-- 3. Aktifkan kembali trigger auth.users
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- 4. Pastikan sinkronisasi ID di tabel profiles
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = '1@sekolah.com') WHERE email = '1@sekolah.com';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'admin@sekolah.sch.id') WHERE email = 'admin@sekolah.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'ahmad.husen@smpn8karawangbarat.sch.id') WHERE email = 'ahmad.husen@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'naen@mail.com') WHERE email = 'naen@mail.com';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'ana@smpn8karawangbarat.sch.id') WHERE email = 'ana@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'awaliatush.sholihah@smpn8karawangbarat.sch.id') WHERE email = 'awaliatush.sholihah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'guru@sekolah.sch.id') WHERE email = 'guru@sekolah.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'damanhuri@smpn8karawangbarat.sch.id') WHERE email = 'damanhuri@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'dede.sumarna@smpn8karawangbarat.sch.id') WHERE email = 'dede.sumarna@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'dede.supriyanto@smpn8karawangbarat.sch.id') WHERE email = 'dede.supriyanto@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'desty.nurbaety@smpn8karawangbarat.sch.id') WHERE email = 'desty.nurbaety@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'elva.mariana@smpn8karawangbarat.sch.id') WHERE email = 'elva.mariana@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'eti.anisyah@smpn8karawangbarat.sch.id') WHERE email = 'eti.anisyah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'hanni.apnianti@smpn8karawangbarat.sch.id') WHERE email = 'hanni.apnianti@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'imi.suminar@smpn8karawangbarat.sch.id') WHERE email = 'imi.suminar@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'iwan.irnawan@smpn8karawangbarat.sch.id') WHERE email = 'iwan.irnawan@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'khossol.jawad@smpn8karawangbarat.sch.id') WHERE email = 'khossol.jawad@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'kepsek@smpn8karawangbarat.sch.id') WHERE email = 'kepsek@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'mardiyah@smpn8karawangbarat.sch.id') WHERE email = 'mardiyah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'maya.hardini@smpn8karawangbarat.sch.id') WHERE email = 'maya.hardini@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'mimin.aminah@smpn8karawangbarat.sch.id') WHERE email = 'mimin.aminah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'mimin.suherman@smpn8karawangbarat.sch.id') WHERE email = 'mimin.suherman@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'mirani.kartini@smpn8karawangbarat.sch.id') WHERE email = 'mirani.kartini@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'muhamad.nurseha@smpn8karawangbarat.sch.id') WHERE email = 'muhamad.nurseha@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'niken.norma@smpn8karawangbarat.sch.id') WHERE email = 'niken.norma@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'nova.indriana@smpn8karawangbarat.sch.id') WHERE email = 'nova.indriana@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'qurotul.aini@smpn8karawangbarat.sch.id') WHERE email = 'qurotul.aini@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'renita.dean@smpn8karawangbarat.sch.id') WHERE email = 'renita.dean@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'rosemalyna.khatimah@smpn8karawangbarat.sch.id') WHERE email = 'rosemalyna.khatimah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'santi.susanti@smpn8karawangbarat.sch.id') WHERE email = 'santi.susanti@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'setiadi.purnomo@smpn8karawangbarat.sch.id') WHERE email = 'setiadi.purnomo@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'shidqy@test.com') WHERE email = 'shidqy@test.com';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'siska.nurnianti@smpn8karawangbarat.sch.id') WHERE email = 'siska.nurnianti@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'siti@sekolah.sch.id') WHERE email = 'siti@sekolah.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'siti.barkah@smpn8karawangbarat.sch.id') WHERE email = 'siti.barkah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'siti.mustikah@smpn8karawangbarat.sch.id') WHERE email = 'siti.mustikah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'siti.nurjamilah@smpn8karawangbarat.sch.id') WHERE email = 'siti.nurjamilah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'sri.dewi@smpn8karawangbarat.sch.id') WHERE email = 'sri.dewi@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'ulfah.nurul@smpn8karawangbarat.sch.id') WHERE email = 'ulfah.nurul@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'umaya.habibah@smpn8karawangbarat.sch.id') WHERE email = 'umaya.habibah@smpn8karawangbarat.sch.id';
UPDATE public.profiles SET id = (SELECT id FROM auth.users WHERE email = 'wahyudin@smpn8karawangbarat.sch.id') WHERE email = 'wahyudin@smpn8karawangbarat.sch.id';
