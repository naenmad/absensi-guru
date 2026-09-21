-- Script untuk memperbarui nama sekolah menjadi SMP Negeri 8 Karawang Barat
UPDATE public.school_settings
SET nama_sekolah = 'SMP Negeri 8 Karawang Barat'
WHERE id IN (SELECT id FROM public.school_settings LIMIT 1);
