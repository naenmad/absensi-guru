'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitPresensiAction } from '@/actions/presensi';
import { calculateDistanceMeters } from '@/lib/geo';
import { formatTimeWIB } from '@/lib/date';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Home,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface PresensiClientProps {
  todayAttendance: any | null;
  activeLeave: any | null;
  settings: any | null;
  forcedType?: 'MASUK' | 'PULANG';
}

export default function PresensiClient({
  todayAttendance,
  activeLeave,
  settings,
  forcedType,
}: PresensiClientProps) {
  const router = useRouter();

  // Tentukan tipe presensi yang seharusnya aktif
  const sudahMasuk = !!todayAttendance?.jam_masuk;
  const sudahPulang = !!todayAttendance?.jam_pulang;
  const isIzinOrSakit =
    todayAttendance?.status === 'IZIN' ||
    todayAttendance?.status === 'SAKIT' ||
    !!activeLeave;

  // Jika sudah masuk dan belum pulang, tipe adalah PULANG
  // Jika belum masuk, tipe adalah MASUK
  const defaultTipe: 'MASUK' | 'PULANG' = sudahMasuk ? 'PULANG' : 'MASUK';
  const tipe: 'MASUK' | 'PULANG' = forcedType || defaultTipe;

  // State GPS
  const [gpsLoading, setGpsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Koordinat Sekolah
  const schoolCoords = {
    lat: settings?.latitude ?? -6.2088,
    lng: settings?.longitude ?? 106.8456,
    radius: settings?.radius_meters ?? 100,
    nama: settings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat',
    jamMasuk: settings?.jam_masuk?.slice(0, 5) || '07:00',
    jamPulang: settings?.jam_pulang?.slice(0, 5) || '15:00',
  };

  // State Kamera & Foto
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // State Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
  } | null>(null);

  // Deteksi GPS Pengguna (hanya jika form aktif)
  const checkLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung fitur geolokasi GPS.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserCoords({ lat: userLat, lng: userLng });

        const dist = calculateDistanceMeters(userLat, userLng, schoolCoords.lat, schoolCoords.lng);
        setDistanceMeters(dist);
        setIsWithinRadius(dist <= schoolCoords.radius);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? 'Izin akses lokasi GPS ditolak. Harap izinkan lokasi di pengaturan browser Anda.'
            : 'Gagal mendapatkan sinyal GPS akurat.'
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Jalankan GPS hanya jika belum lengkap dan tidak izin
  useEffect(() => {
    if (!sudahPulang && !isIzinOrSakit) {
      checkLocation();
    }
  }, [sudahPulang, isIzinOrSakit, schoolCoords.lat, schoolCoords.lng, schoolCoords.radius]);

  // Inisialisasi Kamera Depan hanya saat form aktif
  useEffect(() => {
    if (sudahPulang || isIzinOrSakit) return;

    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Gagal mengakses kamera depan. Pastikan izin kamera telah diberikan.');
      }
    }

    if (!capturedPhoto) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [capturedPhoto, sudahPulang, isIzinOrSakit]);

  // Ambil Swafoto
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Foto Ulang
  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  // Kirim Presensi
  const handleSubmit = async () => {
    if (!userCoords || !capturedPhoto) return;

    setSubmitting(true);
    setSubmitResult(null);

    const res = await submitPresensiAction({
      tipe,
      latitude: userCoords.lat,
      longitude: userCoords.lng,
      fotoBase64: capturedPhoto,
    });

    setSubmitting(false);

    if (res.error) {
      setSubmitResult({ error: res.error });
    } else {
      setSubmitResult({
        success: true,
        message: res.message,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Segarkan halaman dan arahkan kembali ke beranda guru
      setTimeout(() => {
        router.push('/guru');
        router.refresh();
      }, 2000);
    }
  };

  // =========================================================================
  // KONDISI 1: SEDANG IZIN ATAU SAKIT RESMI HARI INI
  // =========================================================================
  if (isIzinOrSakit) {
    const leaveCategory = todayAttendance?.status || activeLeave?.jenis || 'IZIN';
    const leaveReason = todayAttendance?.catatan || activeLeave?.alasan || 'Permohonan izin disetujui';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/guru"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-center">
            <h2 className="text-sm font-semibold text-slate-900">Status Kehadiran</h2>
            <p className="text-[11px] text-slate-500">Izin resmi disetujui pihak sekolah</p>
          </div>
          <div className="w-7" />
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 mb-2">
              Kategori: {leaveCategory}
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              Anda Tercatat {leaveCategory === 'SAKIT' ? 'Sakit' : 'Izin'} Hari Ini
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
              "{leaveReason}"
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
            Data kehadiran Anda telah tercatat otomatis di sistem. Anda tidak perlu melakukan presensi GPS maupun swafoto hari ini.
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              href="/guru"
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg text-center transition shadow-xs"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/guru/izin"
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg text-center transition"
            >
              Riwayat Izin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // KONDISI 2: PRESENSI HARI INI TELAH LENGKAP (MASUK & PULANG SELESAI)
  // =========================================================================
  if (sudahMasuk && sudahPulang) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/guru"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-center">
            <h2 className="text-sm font-semibold text-slate-900">Presensi Hari Ini</h2>
            <p className="text-[11px] text-slate-500">Kehadiran telah tercatat lengkap</p>
          </div>
          <div className="w-7" />
        </div>

        {/* Kartu Ringkasan Selesai */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Status Hari Ini
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                Presensi Hari Ini Telah Lengkap
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Terima kasih atas dedikasi Anda mengajar hari ini di {schoolCoords.nama}. Seluruh catatan presensi Anda telah tersimpan dengan aman.
          </p>

          {/* Rincian Masuk & Pulang */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Box Masuk */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Presensi Masuk</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    todayAttendance.status_masuk === 'TERLAMBAT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {todayAttendance.status_masuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 font-mono">
                {formatTimeWIB(todayAttendance.jam_masuk)}
              </div>
              {todayAttendance.foto_masuk_url && (
                <div className="w-full aspect-video rounded overflow-hidden border border-slate-200">
                  <img
                    src={todayAttendance.foto_masuk_url}
                    alt="Foto Masuk"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Box Pulang */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Presensi Pulang</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-200 text-slate-800">
                  Selesai
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 font-mono">
                {formatTimeWIB(todayAttendance.jam_pulang)}
              </div>
              {todayAttendance.foto_pulang_url && (
                <div className="w-full aspect-video rounded overflow-hidden border border-slate-200">
                  <img
                    src={todayAttendance.foto_pulang_url}
                    alt="Foto Pulang"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              href="/guru"
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg text-center transition shadow-xs"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/guru/riwayat"
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg text-center transition"
            >
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // KONDISI 3 & 4: FORM PRESENSI AKTIF (MASUK ATAU PULANG)
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Header Presensi */}
      <div className="flex items-center justify-between">
        <Link
          href="/guru"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-slate-900">
            Presensi {tipe === 'MASUK' ? 'Masuk' : 'Pulang'}
          </h2>
          <p className="text-[11px] text-slate-500">Validasi lokasi GPS dan swafoto</p>
        </div>
        <div className="w-7" />
      </div>

      {/* Info Jika Sudah Masuk dan Sekarang Giliran Pulang */}
      {sudahMasuk && !sudahPulang && (
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Presensi Masuk Anda:</span>
            <span className="font-semibold text-slate-900">
              {formatTimeWIB(todayAttendance.jam_masuk)} (
              {todayAttendance.status_masuk === 'TERLAMBAT' ? 'Terlambat' : 'Tepat Waktu'})
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
            ✓ Sudah Masuk
          </span>
        </div>
      )}

      {/* Notifikasi Hasil Submit */}
      {submitResult && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
            submitResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {submitResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {submitResult.success ? 'Presensi Berhasil Disimpan' : 'Presensi Gagal'}
            </p>
            <p className="text-[11px] mt-0.5 opacity-90">
              {submitResult.message || submitResult.error}
            </p>
          </div>
        </div>
      )}

      {/* Kartu Status Lokasi GPS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
            Lokasi ({schoolCoords.nama})
          </span>
          <button
            onClick={checkLocation}
            disabled={gpsLoading}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
          >
            <RotateCcw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
            Perbarui GPS
          </button>
        </div>

        {gpsLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            <span>Mendeteksi koordinat GPS perangkat...</span>
          </div>
        ) : gpsError ? (
          <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
        ) : (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isWithinRadius
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div>
              <span className="font-medium block">
                {isWithinRadius ? 'Dalam radius sekolah' : 'Di luar radius sekolah'}
              </span>
              <span className="text-[11px] opacity-80">
                Jarak: <b>{distanceMeters} meter</b> (Maksimum {schoolCoords.radius}m)
              </span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                isWithinRadius ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isWithinRadius ? 'Valid' : 'Di Luar Batas'}
            </span>
          </div>
        )}
      </div>

      {/* Frame Kamera Swafoto */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            Swafoto Wajah
          </span>
          {capturedPhoto && (
            <span className="text-[11px] text-emerald-700 font-medium">Foto siap digunakan</span>
          )}
        </div>

        {cameraError ? (
          <div className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-lg border border-rose-200 text-center">
            <p className="font-semibold">Kamera Tidak Tersedia</p>
            <p className="mt-1 text-[11px]">{cameraError}</p>
          </div>
        ) : (
          <div className="relative aspect-square w-full max-w-[260px] mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Selfie Presensi"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}

            <canvas ref={canvasRef} className="hidden" />

            {!capturedPhoto && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-40 h-48 border border-dashed border-white/50 rounded-full" />
              </div>
            )}
          </div>
        )}

        {/* Tombol Kontrol Kamera */}
        <div className="flex justify-center pt-1">
          {capturedPhoto ? (
            <button
              onClick={retakePhoto}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ambil Foto Ulang
            </button>
          ) : (
            <button
              onClick={takeSnapshot}
              disabled={!!cameraError}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" /> Ambil Foto
            </button>
          )}
        </div>
      </div>

      {/* Tombol Simpan Presensi */}
      <button
        onClick={handleSubmit}
        disabled={!isWithinRadius || !capturedPhoto || submitting}
        className={`w-full py-3 px-4 rounded-xl font-medium text-xs text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          tipe === 'MASUK'
            ? 'bg-slate-900 hover:bg-slate-800'
            : 'bg-emerald-700 hover:bg-emerald-800'
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses Presensi...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Kirim Presensi {tipe === 'MASUK' ? 'Masuk' : 'Pulang'}</span>
          </>
        )}
      </button>

      {/* Catatan Jadwal */}
      <p className="text-[11px] text-slate-500 text-center leading-relaxed">
        Jadwal Jam Kerja: Masuk pukul <b>{schoolCoords.jamMasuk} WIB</b> • Pulang pukul{' '}
        <b>{schoolCoords.jamPulang} WIB</b>.
      </p>
    </div>
  );
}
