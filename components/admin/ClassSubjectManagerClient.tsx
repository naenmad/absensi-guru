'use client';

import React, { useState } from 'react';
import {
  createClassAction,
  deleteClassAction,
  createSubjectAction,
  deleteSubjectAction,
} from '@/actions/schedule';
import {
  QrCode,
  Plus,
  Trash2,
  Printer,
  BookOpen,
  School,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { ClassItem, SubjectItem } from '@/types/database';
import PrintableClassQR from './PrintableClassQR';

interface ClassSubjectManagerProps {
  initialClasses: ClassItem[];
  initialSubjects: SubjectItem[];
  schoolName: string;
}

export default function ClassSubjectManagerClient({
  initialClasses,
  initialSubjects,
  schoolName,
}: ClassSubjectManagerProps) {
  const [activeTab, setActiveTab] = useState<'KELAS' | 'MAPEL'>('KELAS');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [selectedQRClass, setSelectedQRClass] = useState<ClassItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  async function handleCreateClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await createClassAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setShowAddClassModal(false);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleCreateSubject(e: React.FormEvent<HTMLFormElement>) {
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
        setShowAddSubjectModal(false);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleDeleteClass(id: string, name: string) {
    if (!confirm(`Hapus kelas "${name}"? Jadwal dan data presensi terkait akan terhapus.`)) return;
    setDeleteLoadingId(id);
    const res = await deleteClassAction(id);
    setDeleteLoadingId(null);
    if (res.error) alert('Gagal menghapus kelas: ' + res.error);
  }

  async function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`Hapus mata pelajaran "${name}"?`)) return;
    setDeleteLoadingId(id);
    const res = await deleteSubjectAction(id);
    setDeleteLoadingId(null);
    if (res.error) alert('Gagal menghapus mapel: ' + res.error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Kelas & Mata Pelajaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur data rombongan belajar kelas, generate QR Code kelas untuk dicetak, serta kelola mata pelajaran
          </p>
        </div>

        {/* Tab & Action */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-200/70 p-1 rounded-xl text-xs font-semibold flex items-center">
            <button
              onClick={() => setActiveTab('KELAS')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'KELAS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Data Kelas ({initialClasses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('MAPEL')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'MAPEL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mata Pelajaran ({initialSubjects.length})</span>
            </button>
          </div>

          {activeTab === 'KELAS' ? (
            <button
              onClick={() => {
                setFeedback(null);
                setShowAddClassModal(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setFeedback(null);
                setShowAddSubjectModal(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mapel</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: DATA KELAS */}
      {activeTab === 'KELAS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialClasses.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Belum ada data kelas. Klik tombol &quot;Tambah Kelas&quot; untuk membuat kelas baru.
            </div>
          ) : (
            initialClasses.map((kls) => (
              <div
                key={kls.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Tingkat {kls.tingkat}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-800 mt-1">{kls.nama_kelas}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteClass(kls.id, kls.nama_kelas)}
                      disabled={deleteLoadingId === kls.id}
                      className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {kls.deskripsi && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{kls.deskripsi}</p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{kls.kode_qr}</span>
                  </div>
                </div>

                {/* Tombol Cetak QR Code */}
                <button
                  onClick={() => setSelectedQRClass(kls)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-slate-900/15 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Generate & Cetak QR Code</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: DATA MATA PELAJARAN */}
      {activeTab === 'MAPEL' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Nama Mata Pelajaran / Matkul</th>
                  <th className="py-4 px-6">Kode Mapel</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {initialSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      Belum ada data mata pelajaran. Klik &quot;Tambah Mapel&quot; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  initialSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-bold text-slate-800">{sub.nama_mapel}</td>
                      <td className="py-4 px-6 font-mono text-slate-500 font-semibold">
                        {sub.kode_mapel || '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteSubject(sub.id, sub.nama_mapel)}
                          disabled={deleteLoadingId === sub.id}
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
      )}

      {/* MODAL TAMBAH KELAS */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Tambah Kelas Baru</h3>
              <button
                onClick={() => setShowAddClassModal(false)}
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

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas / Ruang *</label>
                <input
                  type="text"
                  name="nama_kelas"
                  required
                  placeholder="Contoh: X RPL 1, Lab Komputer A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat / Angkatan</label>
                <select
                  name="tingkat"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="X">Kelas X (Sepuluh)</option>
                  <option value="XI">Kelas XI (Sebelas)</option>
                  <option value="XII">Kelas XII (Dua Belas)</option>
                  <option value="Umum">Umum / Lab / Aula</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi / Lokasi Ruang</label>
                <input
                  type="text"
                  name="deskripsi"
                  placeholder="Gedung B Lantai 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan & Buat QR</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MAPEL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Tambah Mata Pelajaran</h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
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

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  name="nama_mapel"
                  required
                  placeholder="Contoh: Matematika, Pemrograman Web"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Mapel (Opsional)</label>
                <input
                  type="text"
                  name="kode_mapel"
                  placeholder="MTK-01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
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

      {/* MODAL PRINTABLE QR CODE */}
      {selectedQRClass && (
        <PrintableClassQR
          kelas={selectedQRClass}
          namaSekolah={schoolName}
          onClose={() => setSelectedQRClass(null)}
        />
      )}
    </div>
  );
}
