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
  const [radius, setRadius] = useState<string>(initialSettings?.radius_meters?.toString() || '100');

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
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lokasi & Jam Kerja</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur koordinat pusat sekolah, radius jangkauan presensi, dan jadwal operasional
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border ${
            feedback.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message || feedback.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="id" value={initialSettings?.id || ''} />

        {/* Seksi 1: Profil Sekolah */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Identitas Sekolah</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                name="nama_sekolah"
                required
                defaultValue={initialSettings?.nama_sekolah || 'SMP Negeri 8 Karawang Barat'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                name="alamat"
                defaultValue={initialSettings?.alamat || 'Jl. Pendidikan No. 1'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Seksi 2: Koordinat Geofence */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Titik Koordinat & Radius Presensi</span>
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={gpsDetecting}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200/60"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
              <span>Gunakan Lokasi Saat Ini</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                min={5}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => setRadius('100')}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition cursor-pointer"
                >
                  100m (Resmi)
                </button>
                <button
                  type="button"
                  onClick={() => setRadius('1000')}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition cursor-pointer"
                >
                  1 km
                </button>
                <button
                  type="button"
                  onClick={() => setRadius('50000')}
                  className="px-2 py-0.5 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium transition cursor-pointer"
                >
                  50 km (Testing Bebas)
                </button>
                <button
                  type="button"
                  onClick={() => setRadius('500000')}
                  className="px-2 py-0.5 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 font-medium transition cursor-pointer"
                >
                  500 km (Bebas Lokasi)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seksi 3: Jam Masuk & Pulang */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Jadwal Jam Kerja & Toleransi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                name="jam_masuk"
                required
                defaultValue={initialSettings?.jam_masuk || '07:00'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Pulang</label>
              <input
                type="time"
                name="jam_pulang"
                required
                defaultValue={initialSettings?.jam_pulang || '15:00'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toleransi Keterlambatan (Menit)
              </label>
              <input
                type="number"
                name="toleransi_terlambat_menit"
                required
                min={0}
                max={120}
                defaultValue={initialSettings?.toleransi_terlambat_menit ?? 15}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Presensi setelah jam masuk + toleransi dicatat Terlambat
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
