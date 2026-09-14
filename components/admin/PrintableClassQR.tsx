'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, School, Sparkles } from 'lucide-react';
import { ClassItem } from '@/types/database';

interface PrintableClassQRProps {
  kelas: ClassItem;
  namaSekolah?: string;
  onClose?: () => void;
}

export default function PrintableClassQR({ kelas, namaSekolah = 'SMK Negeri 1 Teladan', onClose }: PrintableClassQRProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">QR Code Siap Cetak</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu QR</span>
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

        {/* PRINTABLE CARD AREA */}
        <div
          ref={printRef}
          className="border-4 border-slate-900 rounded-3xl p-8 text-center space-y-6 bg-white relative print:border-4 print:border-black print:m-4"
        >
          {/* Header Sekolah */}
          <div className="border-b-2 border-slate-200 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <School className="w-6 h-6 text-blue-600 print:text-black" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{namaSekolah}</span>
            </div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              KARTU PRESENSI KBM RUANG KELAS
            </h2>
          </div>

          {/* Nama Kelas */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider print:border print:border-black print:bg-white print:text-black">
              Tingkat {kelas.tingkat}
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight pt-2">
              {kelas.nama_kelas}
            </h1>
            {kelas.deskripsi && (
              <p className="text-xs text-slate-500">{kelas.deskripsi}</p>
            )}
          </div>

          {/* QR Code SVG */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-sm print:border-2 print:border-black">
            <QRCodeSVG
              value={kelas.kode_qr}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Kode Text & Panduan */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md inline-block">
              {kelas.kode_qr}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Bapak/Ibu Guru dipersilakan memindai QR Code ini melalui menu <b>Presensi Kelas</b> di
              aplikasi Absensi saat memulai kegiatan belajar mengajar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
