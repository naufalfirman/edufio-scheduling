'use client';

/**
 * @file Step1Registration.tsx
 * @description Layar 1 — Form Pendaftaran Siswa.
 * Input: Nama Siswa, Program, Jumlah Paket (toggle), Durasi Per Sesi (toggle), Mode Belajar (radio).
 * Menampilkan info kuota sesi dan jam selesai sesuai pilihan durasi.
 */

import { useState } from 'react';
import {
  Program,
  JumlahPaket,
  DurasiPerSesi,
  ModeBelajar,
} from '@/types';
import type { CreateStudentPayload } from '@/types';

interface Step1Props {
  initialData?: Partial<CreateStudentPayload>;
  onNext: (data: CreateStudentPayload) => void;
}

const PROGRAM_OPTIONS = [
  { value: Program.LesPrivatSD, label: 'Les Privat SD' },
  { value: Program.LesPrivatSMP, label: 'Les Privat SMP' },
  { value: Program.LesPrivatSMA, label: 'Les Privat SMA' },
];

const PAKET_OPTIONS = [
  { value: JumlahPaket.Paket4, label: '4 sesi' },
  { value: JumlahPaket.Paket8, label: '8 sesi' },
  { value: JumlahPaket.Paket12, label: '12 sesi' },
];

const DURASI_OPTIONS = [
  { value: DurasiPerSesi.Menit60, label: '60 mnt' },
  { value: DurasiPerSesi.Menit90, label: '90 mnt' },
  { value: DurasiPerSesi.Menit120, label: '120 mnt' },
];

export default function Step1Registration({ initialData, onNext }: Step1Props) {
  const [namaSiswa, setNamaSiswa] = useState(initialData?.namaSiswa ?? '');
  const [program, setProgram] = useState<Program>(initialData?.program ?? Program.LesPrivatSMP);
  const [jumlahPaket, setJumlahPaket] = useState<JumlahPaket>(
    initialData?.jumlahPaket ?? JumlahPaket.Paket8
  );
  const [durasiPerSesi, setDurasiPerSesi] = useState<DurasiPerSesi>(
    initialData?.durasiPerSesi ?? DurasiPerSesi.Menit90
  );
  const [modeBelajar, setModeBelajar] = useState<ModeBelajar>(
    initialData?.modeBelajar ?? ModeBelajar.TutorKeLokasi
  );
  const [errors, setErrors] = useState<{ namaSiswa?: string }>({});

  function handleSubmit() {
    if (!namaSiswa.trim()) {
      setErrors({ namaSiswa: 'Nama siswa wajib diisi.' });
      return;
    }
    setErrors({});
    onNext({ namaSiswa: namaSiswa.trim(), program, jumlahPaket, durasiPerSesi, modeBelajar });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-4">
        <h2 className="text-xl font-bold text-[#004153]">Pendaftaran</h2>
        <p className="text-xs text-[#6b7280] mt-0.5">Langkah 1 dari 4 · data paket les</p>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

        {/* Nama Siswa */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">
            Nama siswa
          </label>
          <input
            id="input-nama-siswa"
            type="text"
            value={namaSiswa}
            onChange={(e) => { setNamaSiswa(e.target.value); setErrors({}); }}
            placeholder="Contoh: Aruna Prameswari"
            className={`
              w-full px-4 py-3 rounded-xl border text-sm text-[#242829] bg-white
              placeholder:text-[#6b7280]/60 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#026C7A]/30 focus:border-[#026C7A]
              ${errors.namaSiswa ? 'border-red-400 bg-red-50' : 'border-[#E3E3E4]'}
            `}
          />
          {errors.namaSiswa && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.namaSiswa}
            </p>
          )}
        </div>

        {/* Program */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">Program</label>
          <div className="relative">
            <select
              id="select-program"
              value={program}
              onChange={(e) => setProgram(e.target.value as Program)}
              className="
                w-full px-4 py-3 rounded-xl border border-[#E3E3E4] text-sm text-[#242829] bg-white
                appearance-none focus:outline-none focus:ring-2 focus:ring-[#026C7A]/30 focus:border-[#026C7A]
                transition-all duration-200
              "
            >
              {PROGRAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Paket */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">
            Jumlah sesi dalam paket
            <span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'var(--edufio-gradient-primary)' }}
            >
              B
            </span>
          </label>
          <div className="flex gap-2">
            {PAKET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`btn-paket-${opt.value}`}
                type="button"
                onClick={() => setJumlahPaket(opt.value)}
                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${jumlahPaket === opt.value
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-[#6b7280] border-[#E3E3E4] hover:border-[#3BB0BF] hover:text-[#026C7A]'
                  }
                `}
                style={jumlahPaket === opt.value ? { background: 'var(--edufio-gradient-primary)' } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Durasi Per Sesi */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-1.5">
            Durasi per sesi
          </label>
          <div className="flex gap-2">
            {DURASI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`btn-durasi-${opt.value}`}
                type="button"
                onClick={() => setDurasiPerSesi(opt.value)}
                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${durasiPerSesi === opt.value
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-[#6b7280] border-[#E3E3E4] hover:border-[#3BB0BF] hover:text-[#026C7A]'
                  }
                `}
                style={durasiPerSesi === opt.value ? { background: 'var(--edufio-gradient-primary)' } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Belajar */}
        <div>
          <label className="block text-sm font-semibold text-[#242829] mb-2">Mode belajar</label>
          <div className="space-y-2">
            {[ModeBelajar.TutorKeLokasi, ModeBelajar.Online].map((mode) => (
              <button
                key={mode}
                id={`btn-mode-${mode === ModeBelajar.TutorKeLokasi ? 'lokasi' : 'online'}`}
                type="button"
                onClick={() => setModeBelajar(mode)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
                  transition-all duration-200
                  ${modeBelajar === mode
                    ? 'border-[#026C7A] bg-[#e6f4f6] text-[#026C7A]'
                    : 'border-[#E3E3E4] bg-white text-[#6b7280] hover:border-[#3BB0BF]'
                  }
                `}
              >
                {/* Custom radio dot */}
                <span
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    transition-colors duration-200
                    ${modeBelajar === mode ? 'border-[#026C7A]' : 'border-[#E3E3E4]'}
                  `}
                >
                  {modeBelajar === mode && (
                    <span className="w-2 h-2 rounded-full bg-[#026C7A]" />
                  )}
                </span>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Info footer */}
        <p className="text-xs text-[#6b7280] bg-[#F9FAFD] border border-[#E3E3E4] rounded-xl px-3 py-2.5">
          💡 Jumlah sesi &amp; durasi mengunci kuota dan jam selesai tiap sesi
        </p>
      </div>

      {/* CTA Button */}
      <div className="px-5 pt-3 pb-2">
        <button
          id="btn-lanjut-step1"
          type="button"
          onClick={handleSubmit}
          className="
            w-full py-4 rounded-2xl text-white font-bold text-base
            transition-all duration-200 active:scale-[0.97] hover:opacity-90 shadow-lg
          "
          style={{ background: 'var(--edufio-gradient-dark)' }}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
