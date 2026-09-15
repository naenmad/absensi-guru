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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
              Langkah 2
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Ruang Kelas & QR Code</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftarkan ruangan belajar dan cetak QR Code unik untuk ditempel di setiap pintu/dinding ruang kelas
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
          <span>Tambah Ruang Kelas</span>
        </button>
      </div>

      {/* Grid Ruang Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialRooms.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Belum ada ruang kelas terdaftar. Klik &quot;Tambah Ruang Kelas&quot; untuk membuat ruangan dan QR Code-nya.
          </div>
        ) : (
          initialRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Ruang Fisik
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-1">{room.nama_ruangan}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(room.id, room.nama_ruangan)}
                    disabled={deleteId === room.id}
                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Hapus Ruangan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {room.gedung && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{room.gedung}</span>
                  </div>
                )}

                {room.deskripsi && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{room.deskripsi}</p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{room.kode_qr}</span>
                </div>
              </div>

              {/* Tombol Cetak QR Code Ruangan */}
              <button
                onClick={() => setSelectedQRRoom(room)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-slate-900/15 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-400" />
                <span>🖨️ Cetak QR Code Ruangan</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH RUANG KELAS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tambah Ruang Kelas Baru</h3>
                <p className="text-xs text-slate-400">Sistem akan otomatis men-generate QR Code unik untuk ruangan ini</p>
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

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  name="nama_ruangan"
                  required
                  placeholder="Contoh: Ruang 101, Lab Komputer 1, Studio Seni"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Fasilitas (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={2}
                  placeholder="Contoh: Kapasitas 36 siswa, dilengkapi proyektor LCD"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan & Buat QR Ruangan</span>}
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
