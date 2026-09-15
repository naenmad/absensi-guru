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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
              Langkah 1
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Mata Pelajaran</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftarkan mata pelajaran atau mata kuliah yang diajarkan di sekolah
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setShowAddModal(true);
          }}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {/* Tabel Mata Pelajaran */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Nama Mata Pelajaran</th>
                <th className="py-4 px-6">Kode Mapel</th>
                <th className="py-4 px-6 text-right">Aksi</th>
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
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>{sub.nama_mapel}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 font-semibold">
                      {sub.kode_mapel || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.nama_mapel)}
                        disabled={deleteId === sub.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Tambah Mata Pelajaran</h3>
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

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  name="nama_mapel"
                  required
                  placeholder="Contoh: Matematika Wajib, Pemrograman Web"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Mapel</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
