'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, QrCode, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const placardRef = useRef<HTMLDivElement>(null);

  // Fungsi cetak isolasi (Hanya mencetak lembar A4 tanpa sidebar/header/backdrop)
  const handlePrint = () => {
    if (!placardRef.current) {
      window.print();
      return;
    }

    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'fixed';
    printWindow.style.right = '0';
    printWindow.style.bottom = '0';
    printWindow.style.width = '0';
    printWindow.style.height = '0';
    printWindow.style.border = '0';
    document.body.appendChild(printWindow);

    const doc = printWindow.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Plakat QR Ruangan - ${room.nama_ruangan}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff;
            color: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 0;
          }
          .sheet-container {
            width: 100%;
            max-width: 650px;
            border: 4px double #3a4a83;
            border-radius: 18px;
            padding: 28px 24px;
            text-align: center;
            background: #ffffff;
            box-shadow: none;
          }
          .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .kop-logo {
            width: 75px;
            text-align: center;
            vertical-align: middle;
          }
          .kop-logo img {
            width: 65px;
            height: auto;
            object-fit: contain;
          }
          .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-right: 20px;
          }
          .kop-text h4 {
            font-size: 13px;
            font-weight: 700;
            color: #334155;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .kop-text h3 {
            font-size: 14px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .kop-text h2 {
            font-size: 20px;
            font-weight: 900;
            color: #3a4a83;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 2px 0;
          }
          .kop-text p {
            font-size: 10px;
            color: #64748b;
          }
          .kop-line-thick {
            height: 3px;
            background: #3a4a83;
            margin-top: 8px;
            width: 100%;
          }
          .kop-line-thin {
            height: 1px;
            background: #3a4a83;
            margin-top: 2px;
            margin-bottom: 20px;
            width: 100%;
          }
          .title-badge {
            display: inline-block;
            background: #eef2fb;
            color: #3a4a83;
            border: 1px solid #3a4a83;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 4px 14px;
            border-radius: 9999px;
            margin-bottom: 8px;
          }
          .room-title {
            font-size: 38px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .room-subtitle {
            font-size: 13px;
            font-weight: 600;
            color: #3a4a83;
            margin-bottom: 16px;
          }
          .qr-box {
            display: inline-block;
            padding: 16px;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 16px;
            margin: 6px auto 14px auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .qr-box svg {
            display: block;
            margin: 0 auto;
          }
          .qr-code-text {
            display: inline-block;
            font-family: monospace;
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 4px 14px;
            border-radius: 6px;
            letter-spacing: 1px;
            margin-bottom: 14px;
          }
          .instructions-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 16px;
            max-width: 520px;
            margin: 0 auto 20px auto;
            text-align: left;
            font-size: 11px;
            color: #475569;
            line-height: 1.5;
          }
          .instructions-box strong {
            color: #1e293b;
          }
          .instructions-box ol {
            padding-left: 18px;
            margin-top: 4px;
          }
          .instructions-box li {
            margin-bottom: 2px;
          }
          .signature-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
            padding-right: 20px;
            text-align: center;
          }
          .signature-box {
            display: inline-block;
            text-align: center;
            font-size: 11px;
            color: #334155;
          }
          .signature-box .sign-name {
            font-weight: 800;
            font-size: 12px;
            color: #0f172a;
            text-decoration: underline;
            margin-top: 48px;
          }
          .signature-box .sign-nip {
            font-size: 10px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <!-- KOP SURAT RESMI -->
          <table class="kop-table">
            <tr>
              <td class="kop-logo">
                <img src="/logo-smpn8karbar.webp" alt="Logo SMPN 8 Karbar">
              </td>
              <td class="kop-text">
                <h4>PEMERINTAH KABUPATEN KARAWANG</h4>
                <h3>DINAS PENDIDIKAN PEMUDA DAN OLAHRAGA</h3>
                <h2>${namaSekolah}</h2>
                <p>Jl. Karangpawitan, Karawang Barat, Jawa Barat • TA 2026/2027</p>
              </td>
            </tr>
          </table>
          <div class="kop-line-thick"></div>
          <div class="kop-line-thin"></div>

          <!-- KONTEN PLAKAT -->
          <div class="title-badge">Papan Identitas & Presensi KBM</div>
          <h1 class="room-title">${room.nama_ruangan}</h1>
          <p class="room-subtitle">
            ${room.gedung || 'Ruang Belajar'} • ${room.tingkat ? `Kelas ${room.tingkat} • ` : ''}Tahun Ajaran 2026/2027
          </p>

          <!-- QR CODE -->
          <div class="qr-box">
            ${placardRef.current.querySelector('.qr-svg-holder')?.innerHTML || ''}
          </div>

          <div>
            <span class="qr-code-text">${room.kode_qr}</span>
          </div>

          <!-- PANDUAN GURU -->
          <div class="instructions-box">
            <strong>Petunjuk Presensi Guru Pengajar:</strong>
            <ol>
              <li>Buka aplikasi <b>Absensi Guru SMPN 8 Karbar</b> di smartphone Bapak/Ibu.</li>
              <li>Pilih menu <b>Presensi KBM</b> lalu arahkan kamera ke QR Code di atas.</li>
              <li>Sistem akan otomatis mencatat jam kehadiran KBM sesuai jadwal pelajaran.</li>
            </ol>
          </div>

          <!-- PENGESAHAN KEPSEK -->
          <div class="signature-area">
            <div class="signature-box">
              <p>Karawang Barat, Juli 2026</p>
              <p>Kepala SMP Negeri 8 Karawang Barat</p>
              <p class="sign-name">MAMAY ABDULLAH, S.Pd., M.Pd.</p>
              <p class="sign-nip">NIP. 19700724 199802 1 003</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Tunggu gambar logo dan style ter-load di iframe lalu panggil dialog print
    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 3000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:static print:z-auto print:overflow-visible">
      {/* Wrapper Modal Dialog */}
      <div className="bg-slate-100 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-300 space-y-4 max-h-[92vh] flex flex-col print:max-w-none print:w-full print:p-0 print:border-none print:bg-white print:shadow-none print:max-h-none">
        
        {/* Modal Top Header (Disembunyikan saat mencetak) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3a4a83]/10 text-[#3a4a83] flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Lembar Cetak QR Code Ruang Kelas
              </h3>
              <p className="text-[11px] text-slate-500">
                Format resmi A4 siap cetak & tempel pada pintu ruang belajar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3.5 bg-[#3a4a83] hover:bg-[#2d3b6a] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Resmi</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* AREA PREVIEW DOKUMEN (Scrollable Preview) */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex justify-center bg-slate-200/60 rounded-xl border border-slate-300/80 print:p-0 print:bg-white print:border-none print:overflow-visible">
          {/* PLACARD KARTU A4 */}
          <div
            ref={placardRef}
            id="printable-qr-placard"
            className="w-full max-w-[620px] bg-white rounded-xl border-4 border-double border-[#3a4a83] p-6 sm:p-8 text-center space-y-4 shadow-md print:shadow-none print:border-4 print:border-double print:border-[#3a4a83] print:p-6 print:m-0 print:max-w-none"
          >
            {/* KOP SURAT RESMI SEKOLAH */}
            <div className="flex items-center justify-center gap-4 pb-2 border-b-2 border-[#3a4a83]">
              <div className="w-16 h-16 shrink-0 p-1 flex items-center justify-center">
                <img
                  src="/logo-smpn8karbar.webp"
                  alt="Logo SMPN 8 Karbar"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center min-w-0">
                <h4 className="text-[11px] font-bold text-slate-600 tracking-wider uppercase leading-tight">
                  Pemerintah Kabupaten Karawang
                </h4>
                <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase leading-tight">
                  Dinas Pendidikan Pemuda dan Olahraga
                </h3>
                <h2 className="text-base sm:text-lg font-black text-[#3a4a83] tracking-tight uppercase leading-tight my-0.5">
                  {namaSekolah}
                </h2>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Jl. Karangpawitan, Karawang Barat, Jawa Barat • TA 2026/2027
                </p>
              </div>
            </div>

            {/* JUDUL PLAKAT */}
            <div className="space-y-1 pt-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#3a4a83]/10 text-[#3a4a83] text-[10px] font-bold uppercase tracking-wider border border-[#3a4a83]/20">
                Papan Identitas & Presensi KBM Digital
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                {room.nama_ruangan}
              </h1>
              <p className="text-xs font-semibold text-[#3a4a83] flex items-center justify-center gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {room.gedung || 'Ruang Belajar'} • {room.tingkat ? `Kelas ${room.tingkat} • ` : ''}Tahun Ajaran 2026/2027
                </span>
              </p>
            </div>

            {/* KOTAK QR CODE DENGAN LOGO DI TENGAH */}
            <div className="py-2">
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-xs">
                <div className="qr-svg-holder">
                  <QRCodeSVG
                    value={room.kode_qr}
                    size={240}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: '/logo-smpn8karbar.webp',
                      x: undefined,
                      y: undefined,
                      height: 42,
                      width: 42,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3.5 py-1 rounded-md inline-block">
                  {room.kode_qr}
                </span>
              </div>
            </div>

            {/* PANDUAN CARA SCAN UNTUK GURU */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left max-w-lg mx-auto text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3a4a83]" />
                <span>Petunjuk Presensi Guru Pengajar:</span>
              </div>
              <ol className="list-decimal pl-5 text-[11px] text-slate-600 space-y-0.5">
                <li>Buka aplikasi <b>Absensi Guru SMPN 8 Karbar</b> pada smartphone Bapak/Ibu.</li>
                <li>Pilih menu <b>Presensi KBM</b> lalu arahkan kamera ke QR Code di atas.</li>
                <li>Sistem otomatis memverifikasi kehadiran mengajar sesuai jadwal kelas.</li>
              </ol>
            </div>

            {/* KOLOM PENGESAHAN KEPALA SEKOLAH */}
            <div className="pt-2 flex justify-end text-center pr-4">
              <div className="text-xs text-slate-700 space-y-1">
                <p className="text-[11px]">Karawang Barat, Juli 2026</p>
                <p className="font-semibold text-[11px]">Kepala SMP Negeri 8 Karawang Barat</p>
                <div className="h-12" /> {/* Tempat Tanda Tangan & Stempel */}
                <p className="font-bold text-slate-900 underline text-xs">
                  MAMAY ABDULLAH, S.Pd., M.Pd.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  NIP. 19700724 199802 1 003
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 print:hidden shrink-0">
          <span>Tips: Gunakan kertas karton / brief card atau laminasi agar tahan lama.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
