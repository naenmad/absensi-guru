'use client';

import React, { useState } from 'react';
import { updateSchoolSettingsAction } from '@/actions/admin';
import {
  MapPin,
  Clock,
  Building,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { SchoolSettings } from '@/types/database';

export default function SchoolSettingsClient({ initialSettings }: { initialSettings: SchoolSettings | null }) {
  const [loading, setLoading] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  const [lat, setLat] = useState<string>(initialSettings?.latitude?.toString() || '-6.2088');
  const [lng, setLng] = useState<string>(initialSettings?.longitude?.toString() || '106.8456');

  // Ambil lokasi perangkat admin saat ini untuk mengisi koordinat
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung geolokasi');
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsDetecting(false);
      },
      (err) => {
        alert('Gagal mendeteksi lokasi: ' + err.message);
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateSchoolSettingsAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Lokasi & Jam Kerja</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tentukan koordinat pusat sekolah, radius geofence presensi, serta jadwal jam masuk/pulang
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2 border ${
            feedback.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message || feedback.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="id" value={initialSettings?.id || ''} />

        {/* Seksi 1: Profil Sekolah */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Identitas Sekolah</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                name="nama_sekolah"
                required
                defaultValue={initialSettings?.nama_sekolah || 'SMK Negeri 1 Teladan'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                name="alamat"
                defaultValue={initialSettings?.alamat || 'Jl. Pendidikan No. 1'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Seksi 2: Koordinat Geofence */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Titik Koordinat & Radius Geofence</span>
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={gpsDetecting}
              className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
              <span>Gunakan Lokasi Saya Saat Ini</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Garis Lintang (Latitude)
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Garis Bujur (Longitude)
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Radius Jangkauan (Meter)
              </label>
              <input
                type="number"
                name="radius_meters"
                required
                min={10}
                max={1000}
                defaultValue={initialSettings?.radius_meters || 100}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Guru hanya dapat absen dalam jarak ini dari titik pusat.
              </span>
            </div>
          </div>
        </div>

        {/* Seksi 3: Jam Masuk & Pulang */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Jadwal Jam Kerja & Toleransi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                name="jam_masuk"
                required
                defaultValue={initialSettings?.jam_masuk || '07:00'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Pulang</label>
              <input
                type="time"
                name="jam_pulang"
                required
                defaultValue={initialSettings?.jam_pulang || '15:00'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toleransi Terlambat (Menit)
              </label>
              <input
                type="number"
                name="toleransi_terlambat_menit"
                required
                min={0}
                max={120}
                defaultValue={initialSettings?.toleransi_terlambat_menit ?? 15}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Presensi setelah jam masuk + toleransi akan dicatat Terlambat.
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
