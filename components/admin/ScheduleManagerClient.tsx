'use client';

import React, { useState } from 'react';
import { createScheduleAction, updateScheduleAction, deleteScheduleAction } from '@/actions/schedule';
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
  Pencil,
} from 'lucide-react';
import { Room, Subject, Profile, Schedule } from '@/types/database';
import Link from 'next/link';
import { useDataTable, DataTableControls, DataTablePagination } from '@/components/ui/DataTablePagination';

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
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  const dayFilteredSchedules = React.useMemo(() => {
    return initialSchedules.filter((s) =>
      selectedHari === 'Semua' ? true : s.hari === selectedHari
    );
  }, [initialSchedules, selectedHari]);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedData,
    filteredCount,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
  } = useDataTable<any>({
    data: dayFilteredSchedules,
    searchFields: [
      (s) => s.hari,
      (s) => s.jam_ke,
      (s) => s.profiles?.nama,
      (s) => s.subjects?.nama_mapel,
      (s) => s.rooms?.nama_ruangan,
      (s) => s.rooms?.gedung,
    ],
    initialPageSize: 25,
  });

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

  async function handleUpdateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateScheduleAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setEditingSchedule(null);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('Hapus jadwal pelajaran ini? Log presensi terkait jadwal ini akan tetap tersimpan.')) {
      return;
    }
    setDeleteId(id);
    const res = await deleteScheduleAction(id);
    setDeleteId(null);
    if (res.error) alert('Gagal menghapus jadwal: ' + res.error);
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Jadwal Mengajar KBM</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar alokasi jam mengajar guru di ruang kelas sesuai kurikulum TA 2026/2027
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/ruangan"
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
          >
            <School className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Ruangan</span>
          </Link>
          <button
            onClick={() => {
              setFeedback(null);
              setShowAddModal(true);
            }}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Hari Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['Semua', ...HARI_LIST].map((hari) => (
          <button
            key={hari}
            onClick={() => {
              setSelectedHari(hari);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedHari === hari
                ? 'bg-[#3a4a83] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {hari}
          </button>
        ))}
      </div>

      {/* Kontrol Pencarian & Baris */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        <DataTableControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama guru, mata pelajaran, ruang kelas..."
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />

        {/* Tabel Data Jadwal */}
        <div className="overflow-x-auto rounded-lg border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Hari & Jam</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Ruang Kelas</th>
                <th className="py-3 px-4">Guru Pengampu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {searchQuery
                      ? `Tidak ditemukan jadwal yang cocok dengan kata kunci "${searchQuery}".`
                      : `Belum ada jadwal mengajar pada hari ${selectedHari}.`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((sch) => {
                  const teacher = sch.profiles || {};
                  const room = sch.rooms || {};
                  const sub = sch.subjects || {};

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded-md bg-[#3a4a83]/10 text-[#3a4a83] text-[11px]">
                            {sch.hari}
                          </span>
                          {sch.jam_ke && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              (Jam ke-{sch.jam_ke})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-slate-600 text-[11px] block mt-1">
                          {sch.jam_mulai?.slice(0, 5)} - {sch.jam_selesai?.slice(0, 5)} WIB
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.nama_mapel || 'Mapel'}</span>
                        </div>
                        {sub.kode_mapel && (
                          <span className="text-[10px] text-slate-400 font-mono block pl-5">
                            {sub.kode_mapel}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.nama_ruangan || 'Ruangan'}</span>
                        </div>
                        {room.gedung && (
                          <span className="text-[10px] text-slate-400 block pl-5">
                            {room.gedung}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{teacher.nama || 'Guru'}</div>
                        <div className="text-[10px] text-slate-400">
                          {teacher.nip ? `NIP. ${teacher.nip}` : teacher.jabatan || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setFeedback(null);
                              setEditingSchedule(sch);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#3a4a83] hover:bg-[#3a4a83]/10 rounded-md transition cursor-pointer"
                            title="Edit Jadwal"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSchedule(sch.id)}
                            disabled={deleteId === sch.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Komponen Paginasi */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalFiltered={filteredCount}
          totalAll={totalItems}
        />
      </div>

      {/* MODAL 1: Tambah Jadwal Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Jadwal Pelajaran</h3>
                <p className="text-xs text-slate-500">Alokasikan sesi mengajar guru</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  feedback.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{feedback.message || feedback.error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengampu *</label>
                <select
                  name="teacher_id"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                    Mata Pelajaran *
                  </label>
                  <select
                    name="subject_id"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                    Ruang Kelas *
                  </label>
                  <select
                    name="room_id"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">-- Pilih Ruang --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama_ruangan} {r.gedung ? `(${r.gedung})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hari *</label>
                  <select
                    name="hari"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Ke- (Opsional)</label>
                  <input
                    type="text"
                    name="jam_ke"
                    placeholder="Contoh: 1-2 atau 3-4"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    name="jam_mulai"
                    required
                    defaultValue="07:30"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    name="jam_selesai"
                    required
                    defaultValue="09:00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <span>Simpan Jadwal</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Jadwal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Jadwal Pelajaran</h3>
                <p className="text-xs text-slate-500">Perbarui sesi jadwal mengajar</p>
              </div>
              <button
                onClick={() => setEditingSchedule(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  feedback.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{feedback.message || feedback.error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSchedule} className="space-y-3.5">
              <input type="hidden" name="id" value={editingSchedule.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengampu *</label>
                <select
                  name="teacher_id"
                  required
                  defaultValue={editingSchedule.teacher_id}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
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
                    Mata Pelajaran *
                  </label>
                  <select
                    name="subject_id"
                    required
                    defaultValue={editingSchedule.subject_id}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruang Kelas *
                  </label>
                  <select
                    name="room_id"
                    required
                    defaultValue={editingSchedule.room_id}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama_ruangan} {r.gedung ? `(${r.gedung})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hari *</label>
                  <select
                    name="hari"
                    required
                    defaultValue={editingSchedule.hari}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Ke- (Opsional)</label>
                  <input
                    type="text"
                    name="jam_ke"
                    defaultValue={editingSchedule.jam_ke || ''}
                    placeholder="Contoh: 1-2 atau 3-4"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    name="jam_mulai"
                    required
                    defaultValue={editingSchedule.jam_mulai?.slice(0, 5)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    name="jam_selesai"
                    required
                    defaultValue={editingSchedule.jam_selesai?.slice(0, 5)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#3a4a83] hover:bg-[#2d3b6a] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-200" /> : <span>Simpan Perubahan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
