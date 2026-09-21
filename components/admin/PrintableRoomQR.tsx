'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, School, QrCode, MapPin } from 'lucide-react';
import { Room } from '@/types/database';

interface PrintableRoomQRProps {
  room: Room;
  namaSekolah?: string;
  onClose?: () => void;
}

export default function PrintableRoomQR({
  room,
  namaSekolah = 'SMP Negeri 8 Karawang Barat',
  onClose,
}: PrintableRoomQRProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0">
        {/* Modal Controls (Disembunyikan saat mencetak) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">QR Code Ruang Kelas</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar QR</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE CARD / PLACARD AREA */}
        <div className="border-2 border-slate-900 rounded-xl p-6 text-center space-y-5 bg-white relative print:border-2 print:border-black print:m-4">
          {/* Header Sekolah */}
          <div className="border-b border-slate-200 pb-3 space-y-0.5">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <School className="w-5 h-5 text-slate-800 print:text-black" />
              <span className="font-bold text-xs uppercase tracking-wider">{namaSekolah}</span>
            </div>
            <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              PRESENSI RUANG KELAS / LABORATORIUM
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
          <div className="p-4 bg-white rounded-xl border border-slate-200 inline-block shadow-xs print:border-2 print:border-black">
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
