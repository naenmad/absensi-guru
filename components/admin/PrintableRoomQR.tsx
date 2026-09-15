'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, School, Sparkles, MapPin } from 'lucide-react';
import { Room } from '@/types/database';

interface PrintableRoomQRProps {
  room: Room;
  namaSekolah?: string;
  onClose?: () => void;
}

export default function PrintableRoomQR({
  room,
  namaSekolah = 'SMK Negeri 1 Teladan',
  onClose,
}: PrintableRoomQRProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0">
        {/* Modal Controls (Disembunyikan saat mencetak) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">QR Code Ruang Kelas Siap Cetak</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar QR</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE CARD / PLACARD AREA */}
        <div className="border-4 border-slate-900 rounded-3xl p-8 text-center space-y-6 bg-white relative print:border-4 print:border-black print:m-4">
          {/* Header Sekolah */}
          <div className="border-b-2 border-slate-200 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <School className="w-6 h-6 text-blue-600 print:text-black" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{namaSekolah}</span>
            </div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              PAPAN IDENTITAS & PRESENSI RUANG KELAS
            </h2>
          </div>

          {/* Nama Ruangan */}
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {room.nama_ruangan}
            </h1>
            {room.gedung && (
              <div className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 print:text-black pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{room.gedung}</span>
              </div>
            )}
            {room.deskripsi && (
              <p className="text-xs text-slate-500 max-w-xs mx-auto pt-1">{room.deskripsi}</p>
            )}
          </div>

          {/* QR Code SVG */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-sm print:border-2 print:border-black">
            <QRCodeSVG
              value={room.kode_qr}
              size={230}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Kode Text & Instruksi untuk Guru */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md inline-block">
              {room.kode_qr}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Bapak/Ibu Guru yang mengajar di ruangan ini, silakan scan QR Code ini melalui aplikasi{' '}
              <b>Absensi Guru</b> saat memulai jam pelajaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
