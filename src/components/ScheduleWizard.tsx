'use client';

/**
 * @file ScheduleWizard.tsx
 * @description Komponen wizard utama penjadwalan sesi les Edufio.
 *
 * Mengorkestrasi 4 layar (steps):
 *  1. Step1Registration  — form data siswa
 *  2. Step2DatePicker    — pemilih tanggal (H+3 rule)
 *  3. Step3SessionDetail — input jam, tempat, materi (overlap & materi rules)
 *  4. Step4Summary       — ringkasan + tombol tambah sesi
 *
 * State Management:
 *  - `student`   : data profil siswa (diisi di Step 1, immutable setelahnya)
 *  - `sessions`  : array sesi terjadwal (terakumulasi setiap simpan Step 3)
 *  - `step`      : step aktif saat ini (1–4)
 *  - `draftDate` : tanggal yang dipilih di Step 2, diteruskan ke Step 3
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { Student, Session, CreateStudentPayload } from '@/types';
import StepIndicator from './wizard/StepIndicator';
import Step1Registration from './wizard/Step1Registration';
import Step2DatePicker from './wizard/Step2DatePicker';
import Step3SessionDetail from './wizard/Step3SessionDetail';
import Step4Summary from './wizard/Step4Summary';

// ================================================================
// HELPERS
// ================================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ================================================================
// COMPONENT
// ================================================================

export default function ScheduleWizard() {
  // ── State ────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [draftDate, setDraftDate] = useState<string>('');

  // Step ke berapa sesi yang sedang dibuat (untuk label "sesi ke-N")
  const currentSessionNumber = sessions.length + 1;

  // ── Handlers ─────────────────────────────────────────────────

  /** Step 1 → 2: simpan data siswa, lanjut pilih tanggal */
  const handleRegistrationNext = useCallback((data: CreateStudentPayload) => {
    const newStudent: Student = { ...data, id: generateId('stu') };
    setStudent(newStudent);
    setStep(2);
  }, []);

  /** Step 2 → 3: simpan tanggal draft, lanjut isi detail sesi */
  const handleDateNext = useCallback((tanggal: string) => {
    setDraftDate(tanggal);
    setStep(3);
  }, []);

  /** Step 3 → 4: simpan sesi baru ke array, lanjut ringkasan */
  const handleSessionSave = useCallback(
    (detail: { jamMulai: string; jamSelesai: string; tempat: string; materi: string }) => {
      if (!student) return;
      const newSession: Session = {
        id: generateId('ses'),
        studentId: student.id,
        tanggal: draftDate,
        jamMulai: detail.jamMulai,
        jamSelesai: detail.jamSelesai,
        tempat: detail.tempat,
        materi: detail.materi,
      };
      setSessions((prev) => [...prev, newSession]);
      setStep(4);
    },
    [student, draftDate]
  );

  /** Step 4 → 2: tambah sesi baru (loop kembali ke pilih tanggal) */
  const handleAddSession = useCallback(() => {
    setDraftDate('');
    setStep(2);
  }, []);

  /** Navigasi mundur */
  const handleBack = useCallback((targetStep: 1 | 2 | 3 | 4) => {
    setStep(targetStep);
  }, []);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#F9FAFD] flex flex-col items-center justify-start">

      {/* ── Phone Shell / Card Container ── */}
      <div
        className="
          w-full max-w-sm mx-auto
          bg-white flex flex-col
          min-h-dvh sm:min-h-0 sm:my-8
          sm:rounded-3xl sm:shadow-xl sm:border sm:border-[#E3E3E4]
          overflow-hidden
        "
        style={{ minHeight: 'min(100dvh, 780px)' }}
      >

        {/* ── Top App Bar ── */}
        <header
          className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0 border-b border-[#E3E3E4]/70"
          style={{ background: 'linear-gradient(135deg, #004153 0%, #026C7A 100%)' }}
        >
          <Image
            src="/edufio-logo.jpg"
            alt="Edufio"
            width={30}
            height={30}
            className="rounded-full object-cover ring-2 ring-white/30"
            priority
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Edufio</p>
            <p className="text-[#99DFEC] text-[10px] leading-tight">Penjadwalan Sesi Les</p>
          </div>
        </header>

        {/* ── Step Indicator ── */}
        <div className="flex-shrink-0 border-b border-[#E3E3E4]/60">
          <StepIndicator currentStep={step} />
        </div>

        {/* ── Step Content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {step === 1 && (
            <Step1Registration
              initialData={student ?? undefined}
              onNext={handleRegistrationNext}
            />
          )}

          {step === 2 && student && (
            <Step2DatePicker
              existingSessions={sessions}
              sessionCount={currentSessionNumber}
              totalPaket={student.jumlahPaket}
              onNext={handleDateNext}
              onBack={() => handleBack(1)}
            />
          )}

          {step === 3 && student && (
            <Step3SessionDetail
              tanggal={draftDate}
              durasiMenit={student.durasiPerSesi}
              modeBelajar={student.modeBelajar}
              existingSessions={sessions}
              jumlahPaket={student.jumlahPaket}
              sessionCount={currentSessionNumber}
              onSave={handleSessionSave}
              onBack={() => handleBack(2)}
            />
          )}

          {step === 4 && student && (
            <Step4Summary
              student={student}
              sessions={sessions}
              onAddSession={handleAddSession}
            />
          )}
        </div>
      </div>

      {/* ── Footer attribution (hanya di desktop) ── */}
      <p className="hidden sm:block text-xs text-[#6b7280] text-center mt-4 mb-6">
        Edufio · Tes Teknis Penjadwalan Les
      </p>
    </div>
  );
}
