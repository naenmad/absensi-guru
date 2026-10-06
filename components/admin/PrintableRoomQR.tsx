'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, QrCode, MapPin, CheckCircle2, FileText, Sparkles } from 'lucide-react';
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

  // Fungsi cetak isolasi yang saklek di ukuran A4 standard ISO 216 (210mm x 297mm)
  const handlePrint = () => {
    if (!placardRef.current) {
      window.print();
      return;
    }

    const svgMarkup = placardRef.current.querySelector('.qr-svg-holder')?.innerHTML || '';

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
            margin: 0; /* Margin 0 agar tidak meluber ke lembar ke-2 */
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 210mm;
            height: 297mm;
            max-width: 210mm;
            max-height: 297mm;
            background: #ffffff;
            color: #0f172a;
            overflow: hidden;
          }
          /* Lembar A4 Saklek Pas 1 Halaman */
          .a4-page {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            box-sizing: border-box;
            padding: 10mm 12mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          /* Bingkai Plakat Resmi Ganda */
          .frame-container {
            width: 100%;
            height: 100%;
            border: 4px double #3a4a83;
            border-radius: 14px;
            padding: 18px 22px;
            text-align: center;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
          }
          /* KOP SURAT */
          .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
          }
          .kop-logo {
            width: 72px;
            text-align: center;
            vertical-align: middle;
          }
          .kop-logo img {
            width: 62px;
            height: auto;
            object-fit: contain;
          }
          .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-right: 15px;
          }
          .kop-text h4 {
            font-size: 11px;
            font-weight: 700;
            color: #334155;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .kop-text h3 {
            font-size: 13px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .kop-text h2 {
            font-size: 18px;
            font-weight: 900;
            color: #3a4a83;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 2px 0;
          }
          .kop-text p {
            font-size: 9.5px;
            color: #64748b;
          }
          .kop-line-thick {
            height: 3px;
            background: #3a4a83;
            margin-top: 6px;
            width: 100%;
          }
          .kop-line-thin {
            height: 1px;
            background: #3a4a83;
            margin-top: 2px;
            margin-bottom: 14px;
            width: 100%;
          }
          /* IDENTITAS RUANG */
          .title-badge {
            display: inline-block;
            background: #eef2fb;
            color: #3a4a83;
            border: 1px solid #3a4a83;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 3px 12px;
            border-radius: 9999px;
            margin-bottom: 6px;
          }
          .room-title {
            font-size: 34px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin-bottom: 3px;
            text-transform: uppercase;
            line-height: 1.1;
          }
          .room-subtitle {
            font-size: 12px;
            font-weight: 600;
            color: #3a4a83;
            margin-bottom: 10px;
          }
          /* AREA QR */
          .qr-box {
            display: inline-block;
            padding: 12px;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 16px;
            margin: 2px auto 8px auto;
          }
          .qr-box svg {
            display: block;
            margin: 0 auto;
            width: 210px;
            height: 210px;
          }
          .qr-code-text {
            display: inline-block;
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 3px 12px;
            border-radius: 6px;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          /* PETUNJUK */
          .instructions-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 14px;
            max-width: 500px;
            margin: 0 auto 10px auto;
            text-align: left;
            font-size: 10.5px;
            color: #475569;
            line-height: 1.45;
          }
          .instructions-box strong {
            color: #1e293b;
          }
          .instructions-box ol {
            padding-left: 18px;
            margin-top: 3px;
          }
          .instructions-box li {
            margin-bottom: 2px;
          }
          /* PENGESAHAN */
          .signature-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 6px;
            padding-right: 14px;
            text-align: center;
          }
          .signature-box {
            display: inline-block;
            text-align: center;
            font-size: 10.5px;
            color: #334155;
          }
          .signature-box .sign-name {
            font-weight: 800;
            font-size: 11.5px;
            color: #0f172a;
            text-decoration: underline;
            margin-top: 38px;
          }
          .signature-box .sign-nip {
            font-size: 9.5px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="a4-page">
          <div class="frame-container">
            <!-- KOP SURAT RESMI -->
            <div>
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
            </div>

            <!-- KONTEN PLAKAT -->
            <div>
              <div class="title-badge">Papan Identitas & Presensi KBM</div>
              <h1 class="room-title">${room.nama_ruangan}</h1>
              <p class="room-subtitle">
                ${room.gedung || 'Ruang Belajar'} • ${room.tingkat ? `Kelas ${room.tingkat} • ` : ''}Tahun Ajaran 2026/2027
              </p>

              <!-- QR CODE -->
              <div class="qr-box">
                ${svgMarkup}
              </div>

              <div>
                <span class="qr-code-text">${room.kode_qr}</span>
              </div>
            </div>

            <!-- PANDUAN GURU -->
            <div>
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
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Tunggu font dan image selesai render di DOM iframe
    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 3000);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:bg-white print:p-0 print:static print:z-auto print:overflow-visible">
      {/* Wrapper Modal Dialog */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full p-4 sm:p-5 shadow-2xl border border-slate-700/80 space-y-3 max-h-[96vh] flex flex-col print:max-w-none print:w-full print:p-0 print:border-none print:bg-white print:shadow-none print:max-h-none">
        
        {/* Modal Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3a4a83] text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Pratinjau Lembar A4 QR Code Ruang
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Pas 1 Halaman A4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Standar ISO 216 (210 × 297 mm) • Saklek siap cetak & tempel pintu kelas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-[#3a4a83] hover:bg-[#2d3b6a] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Resmi (A4)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* AREA PREVIEW DOKUMEN: KANVAS DRAFTING MEJA CETAK */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 shadow-inner">
          
          {/* SIMULASI LEMBAR KERTAS A4 SAKLEK (ASPECT RATIO 210/297) */}
          <div
            ref={placardRef}
            id="printable-qr-placard"
            className="w-full max-w-[540px] aspect-[210/297] bg-white text-slate-900 rounded-sm shadow-2xl p-5 sm:p-7 flex flex-col justify-between select-none relative"
            style={{
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* BINGKAI DOUBLE BORDER RESMI */}
            <div className="w-full h-full border-4 border-double border-[#3a4a83] rounded-lg p-3 sm:p-5 flex flex-col justify-between text-center">
              
              {/* 1. KOP SURAT RESMI SEKOLAH */}
              <div>
                <div className="flex items-center justify-center gap-3 pb-1.5">
                  <div className="w-13 h-13 shrink-0 flex items-center justify-center">
                    <img
                      src="/logo-smpn8karbar.webp"
                      alt="Logo SMPN 8 Karbar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center min-w-0 pr-2">
                    <h4 className="text-[9.5px] font-bold text-slate-600 tracking-wider uppercase leading-tight">
                      Pemerintah Kabupaten Karawang
                    </h4>
                    <h3 className="text-[11px] font-extrabold text-slate-900 tracking-wide uppercase leading-tight">
                      Dinas Pendidikan Pemuda dan Olahraga
                    </h3>
                    <h2 className="text-[14px] sm:text-[15px] font-black text-[#3a4a83] tracking-wide uppercase leading-tight mt-0.5">
                      {namaSekolah}
                    </h2>
                    <p className="text-[8.5px] text-slate-500 font-medium leading-tight">
                      Jl. Karangpawitan, Karawang Barat, Jawa Barat • TA 2026/2027
                    </p>
                  </div>
                </div>

                {/* Garis Tebal & Tipis Kop Surat */}
                <div className="h-[2.5px] bg-[#3a4a83] w-full" />
                <div className="h-[0.8px] bg-[#3a4a83] w-full mt-[1.5px] mb-2 sm:mb-3" />
              </div>

              {/* 2. IDENTITAS RUANG BELAJAR */}
              <div className="space-y-1">
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#3a4a83]/10 text-[#3a4a83] text-[9.5px] font-bold uppercase tracking-wider border border-[#3a4a83]/20">
                    Papan Identitas & Presensi KBM Digital
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                  {room.nama_ruangan}
                </h1>
                <p className="text-[10.5px] font-semibold text-[#3a4a83] flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {room.gedung || 'Ruang Belajar'} • {room.tingkat ? `Kelas ${room.tingkat} • ` : ''}Tahun Ajaran 2026/2027
                  </span>
                </p>

                {/* 3. KOTAK QR CODE DENGAN LOGO DI TENGAH */}
                <div className="py-1">
                  <div className="p-2.5 sm:p-3 bg-white rounded-xl border-2 border-slate-200 inline-block shadow-xs">
                    <div className="qr-svg-holder">
                      <QRCodeSVG
                        value={room.kode_qr}
                        size={180}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: '/logo-smpn8karbar.webp',
                          x: undefined,
                          y: undefined,
                          height: 34,
                          width: 34,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-[10.5px] font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-md inline-block">
                      {room.kode_qr}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. PANDUAN SCAN & PENGESAHAN KEPSEK */}
              <div className="space-y-2">
                {/* Panduan Ringkas Guru */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-left max-w-sm mx-auto text-[9.5px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#3a4a83]" />
                    <span>Petunjuk Presensi Guru Pengajar:</span>
                  </div>
                  <ol className="list-decimal pl-4 text-[9px] text-slate-600 space-y-0.5">
                    <li>Buka aplikasi <b>Absensi Guru SMPN 8 Karbar</b> pada ponsel.</li>
                    <li>Pilih menu <b>Presensi KBM</b> lalu arahkan kamera ke QR Code.</li>
                    <li>Sistem otomatis memverifikasi kehadiran mengajar di kelas ini.</li>
                  </ol>
                </div>

                {/* Kolom Tanda Tangan Pengesahan */}
                <div className="flex justify-end text-center pr-3">
                  <div className="text-[9.5px] text-slate-700 space-y-0.5">
                    <p>Karawang Barat, Juli 2026</p>
                    <p className="font-semibold text-[9.5px]">Kepala SMP Negeri 8 Karawang Barat</p>
                    <div className="h-8 sm:h-9" /> {/* Tempat Tanda Tangan & Stempel */}
                    <p className="font-bold text-slate-900 underline text-[10px]">
                      MAMAY ABDULLAH, S.Pd., M.Pd.
                    </p>
                    <p className="text-[8.5px] text-slate-500 font-mono">
                      NIP. 19700724 199802 1 003
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Dimensi Saklek: 210 × 297 mm (A4 Portrait, 1 Lembar Penuh)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-300 hover:text-white font-medium cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
