'use client';

/**
 * @file Step4Summary.tsx
 * @description Layar 4 — Ringkasan Profil & Sesi Terjadwal.
 * - Kartu profil siswa (nama, program, paket, durasi, mode)
 * - Indikator progress: sesi terjadwal / total paket
 * - Daftar seluruh sesi yang sudah dijadwalkan
 * - Info slot kosong yang tersisa
 * - Tombol "+ Tambah Sesi" untuk loop kembali ke Step 2
 */

import { useMemo } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import Image from 'next/image';
import type { Student, Session } from '@/types';

interface Step4SummaryProps {
  student: Student;
  sessions: Session[];
  onAddSession: () => void;
}

export default function Step4Summary({ student, sessions, onAddSession }: Step4SummaryProps) {
  const totalPaket = student.jumlahPaket;
  const sesiTerjadwal = sessions.length;
  const sesiTersisa = totalPaket - sesiTerjadwal;
  const progressPct = Math.round((sesiTerjadwal / totalPaket) * 100);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jamMulai.localeCompare(b.jamMulai)),
    [sessions]
  );

  function formatTanggalSesi(tanggal: string, jamMulai: string, jamSelesai: string) {
    try {
      const d = new Date(tanggal);
      const dayLabel = format(d, 'EEE, d MMM', { locale: idLocale });
      return `${dayLabel} · ${jamMulai}–${jamSelesai}`;
    } catch {
      return `${tanggal} · ${jamMulai}–${jamSelesai}`;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#004153]">Ringkasan</h2>
          <p className="text-xs text-[#6b7280] mt-0.5">Seluruh jadwal sesi les</p>
        </div>
        <Image
          src="/edufio-logo.jpg"
          alt="Edufio"
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        {/* ── Kartu Profil Siswa ── */}
        <div
          className="rounded-2xl p-4 text-white relative overflow-hidden shadow-lg"
          style={{ background: 'var(--edufio-gradient-dark)' }}
        >
          {/* Dekoratif lingkaran */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative z-10">
            <p className="text-xs font-medium text-[#99DFEC] uppercase tracking-wide mb-1">Siswa</p>
            <h3 className="text-lg font-bold leading-tight">{student.namaSiswa}</h3>
            <p className="text-sm text-[#99DFEC] mt-0.5">{student.program}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                📦 Paket {student.jumlahPaket} sesi
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                ⏱ {student.durasiPerSesi} mnt/sesi
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                {student.modeBelajar === 'Tutor datang ke lokasi' ? '🏠' : '💻'} {student.modeBelajar}
              </span>
            </div>
          </div>
        </div>

        {/* ── Progress Kuota ── */}
        <div className="bg-white rounded-2xl p-4 border border-[#E3E3E4] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#242829]">
              {sesiTerjadwal} sesi terjadwal
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${sesiTersisa === 0
                  ? 'bg-[#e6f4f6] text-[#026C7A]'
                  : 'bg-[#fef6e0] text-[#b45309]'
                }
              `}
            >
              {sesiTersisa === 0 ? '✓ Kuota penuh' : `${sesiTersisa} slot kosong`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-[#E3E3E4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: 'var(--edufio-gradient-primary)',
              }}
            />
          </div>
          <p className="text-xs text-[#6b7280] mt-1.5">
            {sesiTerjadwal} dari {totalPaket} sesi dalam paket
          </p>
        </div>

        {/* ── Daftar Sesi ── */}
        <div>
          <h4 className="text-sm font-bold text-[#004153] mb-2 px-1">Jadwal Sesi</h4>

          {sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-[#6b7280] text-sm">
              <span className="text-3xl block mb-2">📅</span>
              Belum ada sesi yang dijadwalkan.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((sesi, idx) => (
                <div
                  key={sesi.id}
                  id={`session-card-${idx + 1}`}
                  className="bg-white rounded-2xl border border-[#E3E3E4] px-4 py-3.5 flex items-center gap-3 shadow-sm"
                >
                  {/* Nomor sesi */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--edufio-gradient-primary)' }}
                  >
                    {idx + 1}
                  </div>

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#242829] capitalize">
                      {formatTanggalSesi(sesi.tanggal, sesi.jamMulai, sesi.jamSelesai)}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate mt-0.5">{sesi.tempat}</p>
                    <p className="text-xs text-[#026C7A] font-medium truncate">{sesi.materi}</p>
                  </div>

                  {/* Chevron */}
                  <svg className="w-4 h-4 text-[#E3E3E4] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info slot kosong */}
        {sesiTersisa > 0 && (
          <div className="flex items-center gap-2 bg-[#fef6e0] border border-[#FBC84F]/50 rounded-xl px-3.5 py-2.5">
            <svg className="w-4 h-4 text-[#FBC84F] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-[#92400e] font-medium">
              {sesiTersisa} sesi lainnya · {sesiTersisa} slot masih kosong
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pt-3 pb-2">
        <button
          id="btn-tambah-sesi"
          type="button"
          onClick={onAddSession}
          disabled={sesiTersisa === 0}
          className="
            w-full py-4 rounded-2xl font-bold text-base
            transition-all duration-200 active:scale-[0.97] hover:opacity-90 shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          "
          style={
            sesiTersisa > 0
              ? { background: 'var(--edufio-gradient-dark)', color: 'white' }
              : { background: '#E3E3E4', color: '#6b7280' }
          }
        >
          {sesiTersisa === 0 ? '✓ Semua sesi telah terjadwal' : '+ Tambah Sesi'}
        </button>
      </div>
    </div>
  );
}
