-- ====================================================================
-- MIGRASI: KELOLA KELAS, MATA PELAJARAN, JADWAL & QR CODE PRESENSI KELAS
-- Jalankan skrip ini pada Supabase SQL Editor
-- ====================================================================

-- 1. Tabel Kelas
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kelas VARCHAR(100) NOT NULL UNIQUE,
  tingkat VARCHAR(20) DEFAULT 'X',
  kode_qr VARCHAR(100) UNIQUE NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Mata Pelajaran / Mata Kuliah
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_mapel VARCHAR(150) NOT NULL,
  kode_mapel VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Jadwal Mengajar Guru
CREATE TABLE IF NOT EXISTS public.teaching_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  hari VARCHAR(20) NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Presensi KBM Guru di Kelas (Hasil Scan QR di Kelas)
CREATE TABLE IF NOT EXISTS public.class_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.teaching_schedules(id) ON DELETE SET NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jam_keluar TIMESTAMPTZ,
  materi_pembelajaran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendances ENABLE ROW LEVEL SECURITY;

-- Policies for classes
CREATE POLICY "Allow read classes" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage classes" ON public.classes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for subjects
CREATE POLICY "Allow read subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for schedules
CREATE POLICY "Allow read schedules" ON public.teaching_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage schedules" ON public.teaching_schedules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for class attendances
CREATE POLICY "Allow read class attendances" ON public.class_attendances
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
CREATE POLICY "Allow teachers insert class attendances" ON public.class_attendances
  FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Allow teachers update own class attendances" ON public.class_attendances
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid());

-- 6. Seed Contoh Data Kelas & Mapel (jika belum ada)
INSERT INTO public.classes (nama_kelas, tingkat, kode_qr, deskripsi)
VALUES
  ('X RPL 1', 'X', 'QR-KLS-XRPL1-' || substr(md5(random()::text), 1, 6), 'Ruang Teori 101 Lantai 2'),
  ('X RPL 2', 'X', 'QR-KLS-XRPL2-' || substr(md5(random()::text), 1, 6), 'Ruang Teori 102 Lantai 2'),
  ('XI TKJ 1', 'XI', 'QR-KLS-XITKJ1-' || substr(md5(random()::text), 1, 6), 'Lab Jaringan Komputer'),
  ('XII MM 1', 'XII', 'QR-KLS-XIIMM1-' || substr(md5(random()::text), 1, 6), 'Studio Multimedia')
ON CONFLICT (nama_kelas) DO NOTHING;

INSERT INTO public.subjects (nama_mapel, kode_mapel)
VALUES
  ('Matematika Wajib', 'MTK-01'),
  ('Bahasa Indonesia', 'BIN-01'),
  ('Pemrograman Web & Perangkat Bergerak', 'RPL-02'),
  ('Basis Data', 'RPL-03'),
  ('Administrasi Infrastruktur Jaringan', 'TKJ-01'),
  ('Pendidikan Agama & Budi Pekerti', 'PAB-01')
ON CONFLICT (kode_mapel) DO NOTHING;
