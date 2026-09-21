'use client';

import React, { useState } from 'react';
import { createSubjectAction, deleteSubjectAction } from '@/actions/schedule';
import { BookOpen, Plus, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Subject } from '@/types/database';

export default function SubjectManagerClient({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [showModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await createSubjectAction(null, formData);
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus mata pelajaran "${name}"?`)) return;
    setDeleteId(id);
    const res = await deleteSubjectAction(id);
    setDeleteId(null);
    if (res.error) alert('Gagal menghapus mapel: ' + res.error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mata Pelajaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar mata pelajaran yang diajarkan dalam jadwal kelas
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setShowAddModal(true);
          }}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {/* Tabel Mata Pelajaran */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Nama Mata Pelajaran</th>
                <th className="py-3 px-5">Kode Mapel</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {initialSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    Belum ada data mata pelajaran. Klik tombol &quot;Tambah Mata Pelajaran&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                initialSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span>{sub.nama_mapel}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500 font-medium">
                      {sub.kode_mapel || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.nama_mapel)}
                        disabled={deleteId === sub.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH MAPEL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tambah Mata Pelajaran</h3>
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

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  name="nama_mapel"
                  required
                  placeholder="Contoh: Matematika, Pemrograman Dasar"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Mapel (Opsional)
                </label>
                <input
                  type="text"
                  name="kode_mapel"
                  placeholder="Contoh: MTK-01"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                />
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <span>Simpan Mapel</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
