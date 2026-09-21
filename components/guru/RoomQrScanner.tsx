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
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-slate-900">Pindai QR Ruangan</h2>
          <p className="text-[11px] text-slate-500">Arahkan kamera ke QR Code ruangan kelas</p>
        </div>
        <div className="w-7" />
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
            feedback.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{feedback.success ? 'Presensi Ruangan Berhasil' : 'Gagal'}</p>
            <p className="text-[11px] mt-0.5 opacity-90">{feedback.message || feedback.error}</p>
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
                  Waktu Check-in: <b>{feedback.jam} WIB</b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCANNER KAMERA */}
      {!scannedResult && (
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-200">
            <div id="qr-reader" className="w-full" />
          </div>
          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Posisikan QR Code di dalam area kotak pemindai kamera.
          </p>
        </div>
      )}

      {/* KONFIRMASI CHECK-IN SETELAH SCAN */}
      {scannedResult && !feedback?.success && (
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Kode Terdeteksi
              </span>
              <h3 className="font-mono font-semibold text-slate-900 text-xs">{scannedResult}</h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Topik / Materi Pembelajaran (Opsional)
            </label>
            <input
              type="text"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              placeholder="Contoh: Bab 2 - Struktur Atom"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 shadow-xs"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleConfirmAttendance}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Presensi...</span>
                </>
              ) : (
                <span>Konfirmasi Check-in Kelas</span>
              )}
            </button>

            <button
              onClick={resetScan}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Pindai Ulang
            </button>
          </div>
        </div>
      )}

      {/* TOMBOL SETELAH SELESAI */}
      {feedback?.success && (
        <div className="space-y-2">
          <Link
            href="/guru"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
          >
            Kembali ke Beranda
          </Link>
          <button
            onClick={resetScan}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Pindai Ruangan Lain
          </button>
        </div>
      )}
    </div>
  );
}
