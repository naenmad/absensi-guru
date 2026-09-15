'use client';

import React, { useState } from 'react';
import { createScheduleAction, deleteScheduleAction } from '@/actions/schedule';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  User,
  School,
  BookOpen,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Room, Subject, Profile, Schedule } from '@/types/database';
import Link from 'next/link';

interface ScheduleManagerProps {
  initialSchedules: any[];
  teachers: Profile[];
  rooms: Room[];
  subjects: Subject[];
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ScheduleManagerClient({
  initialSchedules,
  teachers,
  rooms,
  subjects,
}: ScheduleManagerProps) {
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  const filteredSchedules = initialSchedules.filter((s) =>
    selectedHari === 'Semua' ? true : s.hari === selectedHari
  );

  async function handleCreateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await createScheduleAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setShowAddModal(false);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('Hapus jadwal pelajaran ini?')) return;
    setDeleteId(id);
    const res = await deleteScheduleAction(id);
    setDeleteId(null);
    if (res.error) alert('Gagal menghapus jadwal: ' + res.error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
              Langkah 3
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Jadwal Pelajaran</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hubungkan Guru Pengampu, Mata Pelajaran, dan Ruang Kelas ber-QR berdasarkan hari dan jam
          </p>
        </div>

        <div className="flex items-center gap-2">
          {rooms.length === 0 && (
            <Link
              href="/admin/ruangan"
              className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
            >
              ⚠️ Harap tambah Ruang Kelas dahulu
            </Link>
          )}

          <button
            onClick={() => {
              setFeedback(null);
              setShowAddModal(true);
            }}
            disabled={rooms.length === 0 || subjects.length === 0}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Hari */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedHari('Semua')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedHari === 'Semua'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Semua Hari ({initialSchedules.length})
        </button>
        {HARI_LIST.map((h) => {
          const count = initialSchedules.filter((s) => s.hari === h).length;
          return (
            <button
              key={h}
              onClick={() => setSelectedHari(h)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedHari === h
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {h} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabel Jadwal */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Hari & Jam</th>
                <th className="py-4 px-6">Mata Pelajaran</th>
                <th className="py-4 px-6">Ruang Kelas (Lokasi QR)</th>
                <th className="py-4 px-6">Guru Pengampu</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada jadwal pelajaran pada hari yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((sch) => {
                  const teacher = sch.profiles || {};
                  const room = sch.rooms || {};
                  const sub = sch.subjects || {};

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs mr-2">
                          {sch.hari}
                        </span>
                        <span className="font-semibold text-slate-700 font-mono">
                          {sch.jam_mulai?.slice(0, 5)} - {sch.jam_selesai?.slice(0, 5)} WIB
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{sub.nama_mapel || 'Mapel'}</span>
                        </div>
                        {sub.kode_mapel && (
                          <span className="text-[10px] text-slate-400 font-mono block pl-5">
                            {sub.kode_mapel}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-purple-600" />
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-bold">
                            {room.nama_ruangan || 'Ruangan'}
                          </span>
                        </div>
                        {room.gedung && (
                          <span className="text-[10px] text-slate-400 block pl-5 mt-0.5">
                            {room.gedung}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{teacher.nama || 'Guru'}</div>
                        <div className="text-[10px] text-slate-400">
                          {teacher.nip ? `NIP. ${teacher.nip}` : teacher.jabatan || '-'}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          disabled={deleteId === sch.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH JADWAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tambah Jadwal Pelajaran</h3>
                <p className="text-xs text-slate-400">
                  Hubungkan Guru, Mata Pelajaran, dan Ruang Kelas ber-QR
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  feedback.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{feedback.message || feedback.error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengampu *</label>
                <select
                  name="teacher_id"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} {t.nip ? `(NIP. ${t.nip})` : ''} - {t.jabatan || 'Guru'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran (Langkah 1) *
                  </label>
                  <select
                    name="subject_id"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruang Kelas (Langkah 2) *
                  </label>
                  <select
                    name="room_id"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Ruang Kelas --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama_ruangan} {r.gedung ? `(${r.gedung})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hari *</label>
                <select
                  name="hari"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {HARI_LIST.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    name="jam_mulai"
                    required
                    defaultValue="07:30"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    name="jam_selesai"
                    required
                    defaultValue="09:00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Jadwal</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
