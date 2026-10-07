-- ======================================================================================
-- MIGRATION: PEMISAHAN PERAN KEPALA SEKOLAH (KEPSEK) DARI ADMIN
-- Deskripsi:
--   1. Menambahkan nilai 'KEPSEK' ke ENUM user_role PostgreSQL.
--   2. Memperbarui akun profil Kepala Sekolah (Mamay Abdullah, S.Pd., M.Pd.)
--      agar memiliki role 'KEPSEK' murni (bukan 'ADMIN' teknis TU).
-- ======================================================================================

-- 1. Tambahkan nilai 'KEPSEK' ke enum public.user_role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'user_role' AND e.enumlabel = 'KEPSEK'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'KEPSEK';
  END IF;
END $$;

-- 2. Perbarui profil Kepala Sekolah ke role 'KEPSEK'
UPDATE public.profiles
SET 
  role = 'KEPSEK'::public.user_role,
  jabatan = 'Kepala Sekolah',
  updated_at = NOW()
WHERE 
  email = 'kepsek@smpn8karawangbarat.sch.id'
  OR nip = '19700724 199802 1 003'
  OR nama ILIKE '%Mamay Abdullah%';

-- 3. Verifikasi hasil pembaruan
SELECT id, nama, nip, email, role, jabatan 
FROM public.profiles 
WHERE role = 'KEPSEK'::public.user_role;
