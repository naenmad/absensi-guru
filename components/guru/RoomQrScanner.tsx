'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { submitRoomAttendanceAction } from '@/actions/schedule';
import { QrCode, CheckCircle2, AlertCircle, Loader2, ArrowLeft, School, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function RoomQrScanner() {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [materi, setMateri] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    nama_ruangan?: string;
    gedung?: string;
    nama_mapel?: string;
    jam?: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannedResult) return;

    // Inisialisasi scanner kamera
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (decodedText.startsWith('QR-RUANG-') || decodedText.includes('QR-')) {
          setScannedResult(decodedText);
          scanner.clear();
        } else {
          alert('QR Code tidak dikenali sebagai QR Ruang Kelas.');
        }
      },
      () => {
        // waiting frame (ignore)
      }
    );

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [scannedResult]);

  async function handleConfirmAttendance() {
    if (!scannedResult) return;

    setLoading(true);
    setFeedback(null);

    const res = await submitRoomAttendanceAction(scannedResult, materi);
    setLoading(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({
        success: true,
        message: res.message,
        nama_ruangan: res.nama_ruangan,
        gedung: res.gedung,
        nama_mapel: res.nama_mapel,
        jam: res.jam,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }

  const resetScan = () => {
    setScannedResult(null);
    setFeedback(null);
    setMateri('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/guru"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-800">Scan QR Ruang Kelas</h2>
          <p className="text-xs text-slate-500">Pindai QR Code yang tertempel di pintu/ruangan kelas</p>
        </div>
        <div className="w-9" />
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 border ${
            feedback.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{feedback.success ? 'Presensi Ruangan Berhasil!' : 'Gagal'}</p>
            <p className="text-xs font-normal mt-0.5">{feedback.message || feedback.error}</p>
            {feedback.success && (
              <div className="mt-2.5 pt-2 border-t border-emerald-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Ruangan: <b>{feedback.nama_ruangan}</b> ({feedback.gedung})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Mata Pelajaran: <b>{feedback.nama_mapel}</b>
                  </span>
                </div>
                <div>
                  Jam Masuk Ruangan: <b>{feedback.jam} WIB</b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCANNER KAMERA */}
      {!scannedResult && (
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
            <div id="qr-reader" className="w-full" />
          </div>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Arahkan kamera HP Anda ke QR Code yang terpasang pada pintu atau dinding ruang kelas.
          </p>
        </div>
      )}

      {/* KONFIRMASI CHECK-IN SETELAH SCAN */}
      {scannedResult && !feedback?.success && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                QR Ruangan Terbaca
              </span>
              <h3 className="font-mono font-bold text-slate-800 text-sm">{scannedResult}</h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pokok Bahasan / Materi Pembelajaran (Opsional)
            </label>
            <input
              type="text"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              placeholder="Contoh: Bab 3 - Persamaan Garis Lurus"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmAttendance}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mencatat Presensi Ruangan...</span>
                </>
              ) : (
                <span>Check-in Masuk Ruang Kelas</span>
              )}
            </button>

            <button
              onClick={resetScan}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Pindai Ulang
            </button>
          </div>
        </div>
      )}

      {/* TOMBOL SETELAH SELESAI */}
      {feedback?.success && (
        <div className="space-y-3">
          <Link
            href="/guru"
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer"
          >
            Kembali ke Beranda Guru
          </Link>
          <button
            onClick={resetScan}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Pindai Ruangan Lain
          </button>
        </div>
      )}
    </div>
  );
}
