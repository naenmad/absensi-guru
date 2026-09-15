export type UserRole = 'ADMIN' | 'GURU';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export type LeaveType = 'IZIN' | 'SAKIT' | 'CUTI';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Profile {
  id: string;
  nip: string | null;
  nama: string;
  email: string;
  role: UserRole;
  jabatan: string | null;
  no_hp: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolSettings {
  id: string;
  nama_sekolah: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  jam_masuk: string;
  jam_pulang: string;
  toleransi_terlambat_menit: number;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  tanggal: string;
  jam_masuk: string | null;
  foto_masuk_url: string | null;
  lat_masuk: number | null;
  lng_masuk: number | null;
  status_masuk: 'TEPAT_WAKTU' | 'TERLAMBAT' | null;
  jam_pulang: string | null;
  foto_pulang_url: string | null;
  lat_pulang: number | null;
  lng_pulang: number | null;
  status: AttendanceStatus;
  catatan: string | null;
  created_at?: string;
  profiles?: Profile;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  jenis: LeaveType;
  tgl_mulai: string;
  tgl_selesai: string;
  alasan: string;
  bukti_url: string | null;
  status: LeaveStatus;
  approved_by: string | null;
  catatan_admin: string | null;
  created_at?: string;
  profiles?: Profile;
}

// 1. MATA PELAJARAN
export interface Subject {
  id: string;
  nama_mapel: string;
  kode_mapel: string | null;
  created_at?: string;
}

// 2. RUANG KELAS (QR Code ditempel di ruangan ini)
export interface Room {
  id: string;
  nama_ruangan: string;
  kode_qr: string;
  gedung: string | null;
  deskripsi: string | null;
  created_at?: string;
}

// 3. JADWAL PELAJARAN (Menyambungkan Guru + Mata Pelajaran + Ruang Kelas)
export interface Schedule {
  id: string;
  teacher_id: string;
  subject_id: string;
  room_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  created_at?: string;
  profiles?: Profile;
  subjects?: Subject;
  rooms?: Room;
}

// 4. PRESENSI KBM GURU DI RUANGAN (Hasil Scan QR Ruangan)
export interface RoomAttendance {
  id: string;
  room_id: string;
  teacher_id: string;
  schedule_id: string | null;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string | null;
  materi_pembelajaran: string | null;
  created_at?: string;
  profiles?: Profile;
  rooms?: Room;
  schedules?: Schedule;
}
