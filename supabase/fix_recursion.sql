-- ====================================================================
-- FIX: INFINITE RECURSION IN RLS POLICY FOR RELATION "profiles"
-- Jalankan skrip ini langsung di Supabase SQL Editor
-- ====================================================================

-- 1. Buat fungsi helper is_admin() dengan SECURITY DEFINER
-- SECURITY DEFINER membuat fungsi ini dieksekusi dengan hak akses superuser/postgres,
-- sehingga pembacaan tabel public.profiles TIDAK memicu evaluasi RLS lagi (mencegah infinite recursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Berikan hak akses eksekusi ke authenticated dan service_role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 2. Hapus policy lama pada public.profiles yang memicu rekursi
DROP POLICY IF EXISTS "Allow users update own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users insert own profile or admin" ON public.profiles;

-- 3. Pasang ulang Policy yang Bersih & Aman pada public.profiles

-- (A) Semua user terautentikasi bisa membaca profil
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- (B) User bisa update profil miliknya sendiri, atau Admin bisa update profil siapa saja
CREATE POLICY "Allow users update own profile or admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- (C) Insert profil baru (dilakukan oleh user itu sendiri atau oleh Admin)
CREATE POLICY "Allow users insert own profile or admin" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- (D) Delete profil hanya bisa oleh Admin
CREATE POLICY "Allow admin delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 4. Update Policy pada tabel lainnya agar menggunakan is_admin() yang lebih cepat & bebas rekursi

-- school_settings
DROP POLICY IF EXISTS "Allow admin update school_settings" ON public.school_settings;
CREATE POLICY "Allow admin update school_settings" ON public.school_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- attendances
DROP POLICY IF EXISTS "Allow users read own attendances or admin" ON public.attendances;
DROP POLICY IF EXISTS "Allow users insert own attendances or admin" ON public.attendances;
DROP POLICY IF EXISTS "Allow users update own attendances or admin" ON public.attendances;

CREATE POLICY "Allow users read own attendances or admin" ON public.attendances
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow users insert own attendances or admin" ON public.attendances
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow users update own attendances or admin" ON public.attendances
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- leave_requests
DROP POLICY IF EXISTS "Allow users read own leaves or admin" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow admin update leaves" ON public.leave_requests;

CREATE POLICY "Allow users read own leaves or admin" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow admin update leaves" ON public.leave_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- classes, subjects, schedules (jika tabel sudah ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classes') THEN
    DROP POLICY IF EXISTS "Allow admin manage classes" ON public.classes;
    CREATE POLICY "Allow admin manage classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subjects') THEN
    DROP POLICY IF EXISTS "Allow admin manage subjects" ON public.subjects;
    CREATE POLICY "Allow admin manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teaching_schedules') THEN
    DROP POLICY IF EXISTS "Allow admin manage schedules" ON public.teaching_schedules;
    CREATE POLICY "Allow admin manage schedules" ON public.teaching_schedules FOR ALL TO authenticated USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_attendances') THEN
    DROP POLICY IF EXISTS "Allow read class attendances" ON public.class_attendances;
    CREATE POLICY "Allow read class attendances" ON public.class_attendances FOR SELECT TO authenticated
      USING (teacher_id = auth.uid() OR public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rooms') THEN
    DROP POLICY IF EXISTS "Allow admin manage rooms" ON public.rooms;
    CREATE POLICY "Allow admin manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedules') THEN
    DROP POLICY IF EXISTS "Allow admin manage schedules" ON public.schedules;
    CREATE POLICY "Allow admin manage schedules" ON public.schedules FOR ALL TO authenticated USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'room_attendances') THEN
    DROP POLICY IF EXISTS "Allow read room attendances" ON public.room_attendances;
    CREATE POLICY "Allow read room attendances" ON public.room_attendances FOR SELECT TO authenticated
      USING (teacher_id = auth.uid() OR public.is_admin());
  END IF;
END $$;
