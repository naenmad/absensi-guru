'use client';

import React, { useState } from 'react';
import { createRoomAction, deleteRoomAction } from '@/actions/schedule';
import {
  School,
  Plus,
  Trash2,
  Printer,
  QrCode,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Room } from '@/types/database';
import PrintableRoomQR from './PrintableRoomQR';

interface RoomManagerClientProps {
  initialRooms: Room[];
  schoolName: string;
}

export default function RoomManagerClient({ initialRooms, schoolName }: RoomManagerClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQRRoom, setSelectedQRRoom] = useState<Room | null>(null);
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
    const res = await createRoomAction(null, formData);
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
    if (!confirm(`Hapus ruang kelas "${name}"? Jadwal dan log presensi terkait di ruangan ini akan terhapus.`)) {
      return;
    }
    setDeleteId(id);
    const res = await deleteRoomAction(id);
    setDeleteId(null);
    if (res.error) alert('Gagal menghapus ruang: ' + res.error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ruang Kelas & QR Code</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar ruangan belajar dan cetak QR Code unik untuk presensi mengajar
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
          <span>Tambah Ruangan</span>
        </button>
      </div>

      {/* Grid Ruang Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialRooms.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Belum ada ruang kelas terdaftar. Klik &quot;Tambah Ruangan&quot; untuk mendaftarkan ruangan.
          </div>
        ) : (
          initialRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium uppercase tracking-wider border border-slate-200/60">
                      Ruang Belajar
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{room.nama_ruangan}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(room.id, room.nama_ruangan)}
                    disabled={deleteId === room.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                    title="Hapus Ruangan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {room.gedung && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.gedung}</span>
                  </div>
                )}

                {room.deskripsi && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{room.deskripsi}</p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{room.kode_qr}</span>
                </div>
              </div>

              {/* Tombol Cetak QR Code Ruangan */}
              <button
                onClick={() => setSelectedQRRoom(room)}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak Lembar QR</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH RUANG KELAS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Ruang Kelas</h3>
                <p className="text-xs text-slate-500">Kode QR otomatis digenerate untuk ruangan ini</p>
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

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  name="nama_ruangan"
                  required
                  placeholder="Contoh: Ruang 101, Lab Komputer"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gedung / Lantai (Opsional)
                </label>
                <input
                  type="text"
                  name="gedung"
                  placeholder="Contoh: Gedung A Lantai 2"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={2}
                  placeholder="Contoh: Kapasitas 36 siswa"
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <span>Simpan Ruangan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINTABLE QR CODE RUANGAN */}
      {selectedQRRoom && (
        <PrintableRoomQR
          room={selectedQRRoom}
          namaSekolah={schoolName}
          onClose={() => setSelectedQRRoom(null)}
        />
      )}
    </div>
  );
}
