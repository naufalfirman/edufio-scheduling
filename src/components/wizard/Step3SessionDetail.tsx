'use client';

/**
 * @file Step3SessionDetail.tsx
 * @description Layar 3 — Detail Sesi.
 * Input: Jam Mulai (dropdown), Tempat, Materi.
 * - Jam selesai dihitung otomatis dari durasi paket.
 * - Jika jam mulai bertabrakan, tampilkan warning kuning (Aturan C).
 * - Materi kosong ditolak (Aturan D).
 */

import { useState, useMemo } from 'react';
import { addMinutes, parse, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { validateSession } from '@/lib/validateSession';
import type { Session } from '@/types';
import { JumlahPaket } from '@/types';

interface Step3SessionDetailProps {
  tanggal: string;           // "YYYY-MM-DD"
  durasiMenit: number;       // 60 | 90 | 120
  modeBelajar: string;
  existingSessions: Session[];
  jumlahPaket: JumlahPaket;
  sessionCount: number;
  onSave: (detail: { jamMulai: string; jamSelesai: string; tempat: string; materi: string }) => void;
  onBack: () => void;
}

// Generate time options 06:00 – 20:30 per 30 menit
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 6; h <= 20; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 20) options.push(`${String(h).padStart(2, '0')}:30`);
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export default function Step3SessionDetail({
  tanggal,
  durasiMenit,
  modeBelajar,
  existingSessions,
  jumlahPaket,
  sessionCount,
  onSave,
  onBack,
}: Step3SessionDetailProps) {
  const [jamMulai, setJamMulai] = useState('10:00');
  const [tempat, setTempat] = useState('');
  const [materi, setMateri] = useState('');
  const [touched, setTouched] = useState({ tempat: false, materi: false });

  // Hitung jam selesai otomatis
  const jamSelesai = useMemo(() => {
    try {
      const start = parse(jamMulai, 'HH:mm', new Date(tanggal));
      return format(addMinutes(start, durasiMenit), 'HH:mm');
    } catch {
      return '--:--';
    }
  }, [jamMulai, durasiMenit, tanggal]);

  // Validasi real-time (hanya overlap, bukan kuota — kuota dicek saat simpan)
  const overlapResult = useMemo(() => {
    if (!jamMulai) return null;
    const result = validateSession({
      existingSessions,
      jumlahPaket,
      tanggalBaru: tanggal,
      jamMulaiBaru: jamMulai,
      durasiMenit,
      materi: materi.trim() || 'placeholder', // hindari false positive Aturan D
    });
    // Hanya perlihatkan warning overlap (C), bukan aturan lain
    if (!result.isValid && result.ruleViolated === 'C') return result;
    return null;
  }, [jamMulai, existingSessions, jumlahPaket, tanggal, durasiMenit, materi]);

  // Format tanggal header
  const tanggalLabel = useMemo(() => {
    try {
      return format(new Date(tanggal), "EEEE, d MMMM yyyy", { locale: idLocale });
    } catch {
      return tanggal;
    }
  }, [tanggal]);

  function handleSave() {
    setTouched({ tempat: true, materi: true });
    if (!tempat.trim() || !materi.trim() || overlapResult) return;
    onSave({ jamMulai, jamSelesai, tempat: tempat.trim(), materi: materi.trim() });
  }

  const tempatError = touched.tempat && !tempat.trim();
  const materiError = touched.materi && !materi.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-3">
        <button
          id="btn-back-step3"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#026C7A] font-medium mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Detail sesi
        </button>
        <p className="text-xs text-[#6b7280] capitalize">{tanggalLabel} · sesi ke-{sessionCount}</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

        {/* Jam Mulai */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">Jam mulai</label>
          <div className="relative">
            <select
              id="select-jam-mulai"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl border border-[#E3E3E4] text-sm text-[#242829] bg-white
                appearance-none focus:outline-none focus:ring-2 focus:ring-[#026C7A]/30 focus:border-[#026C7A]
                transition-all duration-200
              "
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Info jam selesai */}
          <p className="text-xs text-[#6b7280] mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#3BB0BF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            Selesai {jamSelesai} · durasi {durasiMenit} menit (dari paket)
          </p>

          {/* ⚠️ Warning overlap — Aturan C */}
          {overlapResult && (
            <div
              id="warning-overlap"
              className="
                mt-2.5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                border border-[#FBC84F] bg-[#fef6e0]
              "
            >
              <svg className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-[#92400e]">Bentrok dengan sesi lain</p>
                <p className="text-xs text-[#92400e] mt-0.5">{overlapResult.error}</p>
                <p className="text-xs text-[#b45309] mt-1">Geser jam mulai untuk melanjutkan.</p>
              </div>
            </div>
          )}
        </div>

        {/* Tempat */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">Tempat</label>
          <input
            id="input-tempat"
            type="text"
            value={tempat}
            onChange={(e) => { setTempat(e.target.value); setTouched((t) => ({ ...t, tempat: true })); }}
            placeholder={
              modeBelajar === 'Online'
                ? 'Contoh: Zoom · meet.google.com/...'
                : 'Contoh: Rumah siswa — Jl. Kaliurang KM 5'
            }
            className={`
              w-full px-4 py-3 rounded-xl border text-sm text-[#242829] bg-white
              placeholder:text-[#6b7280]/60 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#026C7A]/30 focus:border-[#026C7A]
              ${tempatError ? 'border-red-400 bg-red-50' : 'border-[#E3E3E4]'}
            `}
          />
          <p className="text-xs text-[#6b7280] mt-1">Mode: {modeBelajar}</p>
          {tempatError && (
            <p className="text-xs text-red-500 mt-1">⚠ Tempat wajib diisi.</p>
          )}
        </div>

        {/* Materi */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">
            Materi yang akan disampaikan
            <span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'var(--edufio-gradient-primary)' }}
            >
              D
            </span>
          </label>
          <textarea
            id="input-materi"
            value={materi}
            onChange={(e) => { setMateri(e.target.value); setTouched((t) => ({ ...t, materi: true })); }}
            placeholder="Contoh: Persamaan linear dua variabel — soal cerita."
            rows={3}
            className={`
              w-full px-4 py-3 rounded-xl border text-sm text-[#242829] bg-white resize-none
              placeholder:text-[#6b7280]/60 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#026C7A]/30 focus:border-[#026C7A]
              ${materiError ? 'border-red-400 bg-red-50' : 'border-[#E3E3E4]'}
            `}
          />
          {materiError ? (
            <p className="text-xs text-red-500 mt-1">⚠ Wajib diisi, tidak boleh kosong.</p>
          ) : (
            <p className="text-xs text-[#3BB0BF] mt-1">Wajib diisi, tidak boleh kosong</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pt-3 pb-2">
        <button
          id="btn-simpan-sesi"
          type="button"
          onClick={handleSave}
          disabled={!!overlapResult}
          className="
            w-full py-4 rounded-2xl text-white font-bold text-base
            transition-all duration-200 active:scale-[0.97] hover:opacity-90 shadow-lg
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          "
          style={{ background: 'var(--edufio-gradient-dark)' }}
        >
          Simpan sesi
        </button>
      </div>
    </div>
  );
}
