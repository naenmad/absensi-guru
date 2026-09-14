# 📱 Sistem Absensi Guru & Tenaga Kependidikan

Aplikasi sistem pencatatan kehadiran digital untuk Guru & Tenaga Kependidikan (PTK) berbasis **Next.js 16 (App Router)** dan **Supabase** (PostgreSQL, Auth, Storage). Dilengkapi validasi lokasi radius sekolah (GPS Geofencing) dan verifikasi swafoto kamera depan (*selfie*), dengan akun yang dikelola secara terpusat oleh Admin Sekolah.

---

## 🚀 Fitur Utama

### 👨‍🏫 Portal Guru (Mobile-First / PWA)
- **Login Fleksibel**: Dapat masuk menggunakan **NIP** atau **Email** beserta kata sandi yang dibuatkan Admin.
- **Presensi Harian Masuk & Pulang**:
  - Validasi lokasi real-time dengan GPS (hanya bisa absen jika berada dalam radius sekolah).
  - Swafoto kamera depan (*live capture selfie*) untuk mencegah kecurangan.
  - Deteksi keterlambatan otomatis berdasarkan jam masuk dan toleransi sekolah.
- **Presensi Masuk Kelas (Scan QR Code KBM)**: Pindai QR Code yang tertempel di dinding kelas menggunakan kamera HP untuk mencatat kehadiran mengajar sesuai jadwal dan mencatat materi pelajaran.
- **Jadwal Mengajar Pribadi**: Memantau daftar kelas dan mata pelajaran yang diampu hari ini.
- **Permohonan Izin / Sakit / Cuti**: Formulir pengajuan izin dengan upload berkas surat dokter/dinas dan pelacakan status (*Pending, Disetujui, Ditolak*).
- **Riwayat Presensi**: Log kehadiran pribadi 30 hari terakhir dan ringkasan kedisiplinan.

### 🏫 Portal Admin Sekolah (Dashboard Desktop)
- **Monitoring Real-Time**: Pantau kehadiran hari ini, statistik kehadiran tepat waktu, terlambat, izin, dan guru yang belum hadir.
- **Manajemen Akun Guru**: Admin mendaftarkan akun guru baru secara terpusat via API Supabase Admin.
- **Kelola Kelas & Mata Pelajaran**: Tambah rombongan belajar / ruang kelas, atur mata pelajaran, dan **Generate Kartu QR Code Siap Cetak** untuk ditempel di setiap ruang kelas.
- **Kelola Jadwal Mengajar (KBM)**: Memetakan guru pengampu, mata pelajaran, ruang kelas, hari, dan jam pelajaran.
- **Pengaturan Geofence & Jam Kerja**: Atur koordinat lintang/bujur sekolah, toleransi radius geofence (meter), jam masuk, jam pulang, serta toleransi keterlambatan.
- **Persetujuan Izin**: Tinjau pengajuan izin/sakit guru dengan opsi persetujuan atau penolakan.
- **Rekapitulasi & Ekspor Laporan**: Filter per bulan dan unduh laporan ke format Excel/CSV.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.3 (App Router, Server Actions)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Ikon**: Lucide React
- **Geolokasi**: Formula Haversine (Web Geolocation API)

---

## 📋 Panduan Setup & Instalasi

### 1. Clone & Install Dependensi
```bash
git clone https://github.com/username/absensi-guru.git
cd absensi-guru
npm install
```

### 2. Konfigurasi Database Supabase
1. Buat proyek baru di [Supabase Dashboard](https://database.new).
2. Buka menu **SQL Editor** pada proyek Supabase Anda.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) pada repositori ini, salin seluruh isinya dan jalankan (*Run*) di SQL Editor Supabase.
   - *Skrip ini akan otomatis membuat tabel `profiles`, `school_settings`, `attendances`, `leave_requests`, triggers, dan storage buckets.*

### 3. Setup Akun Admin Pertama Kali
Jalankan query SQL berikut di SQL Editor Supabase untuk membuat profil admin atau ubah role akun Anda:
```sql
-- Setelah membuat user pertama di Supabase Auth (Authentication -> Users -> Add User):
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@sekolah.sch.id';
```

### 4. Konfigurasi Environment Variables (`.env.local`)
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi nilainya:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> ⚠️ **Penting**: `SUPABASE_SERVICE_ROLE_KEY` wajib diisi agar fitur pembuatan akun guru oleh admin dapat berjalan. Dapatkan di **Supabase Dashboard -> Project Settings -> API -> `service_role` key**.

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

---

## 📂 Struktur Direktori Proyek

```plaintext
absensi-guru/
├── actions/                  # Server Actions (auth, presensi, izin, admin)
│   ├── admin.ts
│   ├── auth.ts
│   ├── izin.ts
│   └── presensi.ts
├── app/
│   ├── (auth)/
│   │   └── login/            # Halaman login NIP / Email
│   ├── (guru)/               # Antarmuka guru (Mobile-First)
│   │   ├── izin/             # Pengajuan izin / sakit
│   │   ├── presensi/         # Kamera selfie & GPS geofencing
│   │   ├── riwayat/          # Riwayat kehadiran harian
│   │   └── page.tsx          # Beranda guru & status hari ini
│   ├── (admin)/              # Dashboard desktop admin
│   │   ├── guru/             # Manajemen akun & data guru
│   │   ├── jadwal/           # Titik koordinat sekolah & jam kerja
│   │   ├── persetujuan/      # Review izin guru
│   │   ├── laporan/          # Rekapitulasi & export CSV
│   │   └── page.tsx          # Dashboard ringkasan real-time
│   └── api/settings/         # Route Handler pengaturan sekolah
├── components/
│   ├── admin/                # Komponen antarmuka admin
│   └── guru/                 # Komponen antarmuka guru (LiveClock, Kamera, dll)
├── lib/
│   ├── geo.ts                # Rumus Haversine & validasi radius
│   └── supabase/             # Client SSR, Server, Admin, dan Middleware
├── supabase/
│   └── schema.sql            # Skema lengkap PostgreSQL & RLS
└── types/                    # Definisi tipe TypeScript
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi [MIT License](LICENSE).
