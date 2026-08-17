'use client';

/**
 * @file Step2DatePicker.tsx
 * @description Layar 2 — Pemilih Tanggal Kalender.
 * - Kalender bulan penuh (navigasi bulan)
 * - Tanggal < H+3 → disabled (abu-abu, tidak bisa diklik)
 * - Tanggal hari ini → ditandai dengan cincin
 * - Tanggal yang sudah ada sesi → titik indikator
 * - Tanggal dipilih → highlight gradient primary
 */

import { useState, useMemo } from 'react';
import {
  startOfDay,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isEqual,
  format,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Session } from '@/types';

interface Step2DatePickerProps {
  existingSessions: Session[];
  sessionCount: number;     // sesi ke-berapa yang sedang dibuat
  totalPaket: number;
  onNext: (tanggal: string) => void;
  onBack: () => void;
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Step2DatePicker({
  existingSessions,
  sessionCount,
  totalPaket,
  onNext,
  onBack,
}: Step2DatePickerProps) {
  const today = startOfDay(new Date());
  const minDate = addDays(today, 3); // Aturan A: minimal H+3

  const [viewMonth, setViewMonth] = useState<Date>(minDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState('');

  // Tanggal-tanggal yang sudah ada sesi
  const sessionDates = useMemo(
    () => existingSessions.map((s) => startOfDay(new Date(s.tanggal))),
    [existingSessions]
  );

  // Bangun grid kalender: mulai Senin, isi sampai akhir Minggu di bulan
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  function isDisabled(day: Date): boolean {
    return isBefore(day, minDate) && !isEqual(day, minDate);
  }

  function hasSession(day: Date): boolean {
    return sessionDates.some((d) => isSameDay(d, day));
  }

  function handleSelectDate(day: Date) {
    if (isDisabled(day)) return;
    setSelectedDate(day);
    setError('');
  }

  function handleNext() {
    if (!selectedDate) {
      setError('Silakan pilih tanggal sesi terlebih dahulu.');
      return;
    }
    onNext(format(selectedDate, 'yyyy-MM-dd'));
  }

  const monthLabel = format(viewMonth, 'MMMM yyyy', { locale: idLocale });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-2">
        <button
          id="btn-back-step2"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#026C7A] font-medium mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Pilih tanggal
        </button>
        <p className="text-xs text-[#6b7280]">
          Sesi ke-{sessionCount} · {existingSessions.length} dari {totalPaket} sesi terjadwal
        </p>
      </div>

      {/* Kalender */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Navigasi bulan */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            id="btn-prev-month"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e6f4f6] text-[#026C7A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-[#004153] capitalize">{monthLabel}</span>
          <button
            id="btn-next-month"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e6f4f6] text-[#026C7A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Header hari */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#6b7280] py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid tanggal */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day) => {
            const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
            const disabled = isDisabled(day);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const hasSes = hasSession(day);

            return (
              <div
                key={day.toISOString()}
                className="flex flex-col items-center py-0.5"
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDate(day)}
                  id={`cal-day-${format(day, 'yyyy-MM-dd')}`}
                  className={`
                    relative w-9 h-9 rounded-full text-sm font-medium
                    flex items-center justify-center
                    transition-all duration-200
                    ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                    ${disabled
                      ? 'text-[#6b7280]/40 cursor-not-allowed'
                      : isSelected
                      ? 'text-white shadow-md'
                      : isToday
                      ? 'ring-2 ring-[#3BB0BF] text-[#026C7A] font-bold'
                      : 'text-[#242829] hover:bg-[#e6f4f6] hover:text-[#026C7A]'
                    }
                  `}
                  style={isSelected ? { background: 'var(--edufio-gradient-primary)' } : {}}
                  aria-label={format(day, 'dd MMMM yyyy', { locale: idLocale })}
                  aria-pressed={isSelected}
                  aria-disabled={disabled}
                >
                  {day.getDate()}
                </button>
                {/* Indikator sesi */}
                {isCurrentMonth && hasSes && !disabled && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-[#3BB0BF]'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-1.5 px-1">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className="w-2 h-2 rounded-full bg-[#3BB0BF] flex-shrink-0" />
            sudah ada sesi
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className="w-4 h-4 rounded-full ring-2 ring-[#3BB0BF] flex-shrink-0" />
            hari ini ({format(today, 'd MMM', { locale: idLocale })})
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className="w-4 h-4 rounded-full bg-[#6b7280]/20 flex-shrink-0" />
            belum bisa dipilih — minimal 3 hari dari hari ini
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <span>⚠</span> {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pt-3 pb-2">
        <button
          id="btn-lanjut-step2"
          type="button"
          onClick={handleNext}
          disabled={!selectedDate}
          className="
            w-full py-4 rounded-2xl text-white font-bold text-base
            transition-all duration-200 active:scale-[0.97] hover:opacity-90 shadow-lg
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          "
          style={{ background: 'var(--edufio-gradient-dark)' }}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
