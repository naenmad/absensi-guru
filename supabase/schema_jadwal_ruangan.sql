-- ====================================================================
-- SKEMA BASIS DATA: MATA PELAJARAN, RUANG KELAS (QR), & JADWAL PELAJARAN
-- ====================================================================

-- 1. Tabel Mata Pelajaran (Langkah 1)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_mapel VARCHAR(150) NOT NULL,
  kode_mapel VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Ruang Kelas Fisik (Langkah 2 - QR Code unik dicetak per ruangan)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_ruangan VARCHAR(100) NOT NULL UNIQUE,
  kode_qr VARCHAR(100) UNIQUE NOT NULL,
  gedung VARCHAR(100),
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Jadwal Pelajaran (Langkah 3 - Menyambungkan Guru + Mapel + Ruangan)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  hari VARCHAR(20) NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Presensi KBM Guru di Ruang Kelas (Hasil Scan QR Ruangan)
CREATE TABLE IF NOT EXISTS public.room_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jam_keluar TIMESTAMPTZ,
  materi_pembelajaran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_attendances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage rooms" ON public.rooms FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow read schedules" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage schedules" ON public.schedules FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow read room attendances" ON public.room_attendances FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin());
CREATE POLICY "Allow teachers insert room attendances" ON public.room_attendances FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Allow teachers update room attendances" ON public.room_attendances FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid());
