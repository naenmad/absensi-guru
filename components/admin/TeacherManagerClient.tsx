'use client';

import React, { useState } from 'react';
import {
  createTeacherAction,
  updateTeacherAction,
  resetTeacherPasswordAction,
  deleteTeacherAction,
} from '@/actions/admin';
import {
  UserPlus,
  Trash2,
  Lock,
  Mail,
  User,
  Briefcase,
  Phone,
  Hash,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Pencil,
  KeyRound,
  Shield,
} from 'lucide-react';
import { useDataTable, DataTableControls, DataTablePagination } from '@/components/ui/DataTablePagination';

interface Teacher {
  id: string;
  nama: string;
  nip: string | null;
  email: string;
  jabatan: string | null;
  no_hp: string | null;
  role?: string;
  created_at?: string;
}

export default function TeacherManagerClient({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [resetPwdTeacher, setResetPwdTeacher] = useState<Teacher | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  // Hook pagination & search cerdas
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
  } = useDataTable<Teacher>({
    data: initialTeachers,
    searchFields: [
      (t) => t.nama,
      (t) => t.nip,
      (t) => t.email,
      (t) => t.jabatan,
      (t) => t.no_hp,
      (t) => t.role,
    ],
    initialPageSize: 10,
  });

  async function handleCreateTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await createTeacherAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setShowAddModal(false);
        setFeedback(null);
      }, 1500);
    }
  }

  async function handleUpdateTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateTeacherAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setEditingTeacher(null);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await resetTeacherPasswordAction(null, formData);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setResetPwdTeacher(null);
        setFeedback(null);
      }, 1200);
    }
  }

  async function handleDeleteTeacher(id: string, name: string) {
    if (
      !confirm(
        `PERINGATAN: Anda yakin ingin menghapus akun guru "${name}"? Data presensi dan jadwal terkait mungkin akan terpengaruh.`
      )
    ) {
      return;
    }

    setDeleteLoadingId(id);
    const res = await deleteTeacherAction(id);
    setDeleteLoadingId(null);

    if (res.error) {
      alert('Gagal menghapus guru: ' + res.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Guru & Akun</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data akun pendidik, edit profil, reset kata sandi, dan kredensial akses
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setShowAddModal(true);
          }}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Guru</span>
        </button>
      </div>

      {/* Kontrol Pencarian & Baris */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        <DataTableControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama guru, NIP, email, jabatan..."
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />

        {/* Tabel Data Guru */}
        <div className="overflow-x-auto rounded-lg border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Nama & NIP</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">No. Telepon</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {searchQuery
                      ? `Tidak ditemukan guru yang cocok dengan kata kunci "${searchQuery}".`
                      : 'Belum ada data guru terdaftar.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{teacher.nama}</div>
                      <div className="text-[11px] text-slate-400">
                        {teacher.nip ? `NIP. ${teacher.nip}` : 'NIP Belum Diisi'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{teacher.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200/60">
                        {teacher.jabatan || 'Guru'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const isTeacherKepsek =
                          teacher.role === 'KEPSEK' ||
                          teacher.jabatan?.toLowerCase().includes('kepala sekolah');
                        return (
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
                              isTeacherKepsek
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : teacher.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isTeacherKepsek ? 'KEPSEK' : teacher.role || 'GURU'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{teacher.no_hp || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Guru Button */}
                        <button
                          onClick={() => {
                            setFeedback(null);
                            setEditingTeacher(teacher);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3a4a83] hover:bg-[#3a4a83]/10 rounded-md transition cursor-pointer"
                          title="Edit Profil Guru"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => {
                            setFeedback(null);
                            setResetPwdTeacher(teacher);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                          title="Reset Kata Sandi"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Guru Button */}
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.nama)}
                          disabled={deleteLoadingId === teacher.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer disabled:opacity-50"
                          title="Hapus Akun Guru"
                        >
                          {deleteLoadingId === teacher.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* MODAL 1: Tambah Guru Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Akun Guru</h3>
                <p className="text-xs text-slate-500">
                  Data kredensial guru untuk presensi
                </p>
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

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="nama"
                    required
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="nip"
                      placeholder="19870101..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Mapel</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="jabatan"
                      placeholder="Guru Matematika"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Akun *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="guru@sekolah.sch.id"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="Min. 6 Karakter"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="no_hp"
                    placeholder="08123456789"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Akun</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Profil Guru */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Data Guru</h3>
                <p className="text-xs text-slate-500">Perbarui informasi pengajar</p>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
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

            <form onSubmit={handleUpdateTeacher} className="space-y-3.5">
              <input type="hidden" name="id" value={editingTeacher.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="nama"
                    required
                    defaultValue={editingTeacher.nama}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="nip"
                      defaultValue={editingTeacher.nip || ''}
                      placeholder="NIP resmi"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Akun (Role)</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      name="role"
                      defaultValue={editingTeacher.role || 'GURU'}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="GURU">GURU</option>
                      <option value="ADMIN">ADMIN / KEPSEK</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Mapel</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="jabatan"
                      defaultValue={editingTeacher.jabatan || ''}
                      placeholder="Guru Mapel"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="no_hp"
                      defaultValue={editingTeacher.no_hp || ''}
                      placeholder="0812..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Akun (Terkunci)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled
                    value={editingTeacher.email}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Email digunakan sebagai ID sistem autentikasi
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-[#3a4a83] hover:bg-[#2d3b6a] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Kata Sandi Guru */}
      {resetPwdTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Kata Sandi</h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  Akun: {resetPwdTeacher.nama}
                </p>
              </div>
              <button
                onClick={() => setResetPwdTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
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

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <input type="hidden" name="userId" value={resetPwdTeacher.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter (cth: guru123)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 placeholder:text-slate-400"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Guru dapat langsung masuk dengan kata sandi baru ini.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPwdTeacher(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mereset...</span>
                    </>
                  ) : (
                    <span>Terapkan Sandi Baru</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
