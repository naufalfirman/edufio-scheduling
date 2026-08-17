/**
 * @file validateSession.ts
 * @description Fungsi helper untuk memvalidasi pendaftaran sesi les Edufio.
 *
 * Aturan Bisnis:
 *  - Aturan A: Tanggal sesi minimal H+3 dari hari ini.
 *  - Aturan B: Total sesi terjadwal tidak boleh melebihi jumlahPaket.
 *  - Aturan C: Sesi baru tidak boleh overlap dengan sesi lain di hari yang sama.
 *  - Aturan D: Materi tidak boleh kosong.
 */

import {
  parseISO,
  addDays,
  startOfDay,
  isAfter,
  isEqual,
  parse,
  addMinutes,
  isBefore,
} from "date-fns";
import type { Session } from "@/types";
import { JumlahPaket } from "@/types";

// ================================================================
// RETURN TYPE
// ================================================================

/** Kode identitas tiap aturan bisnis untuk keperluan logging/testing. */
export type ValidationRuleCode = "A" | "B" | "C" | "D";

/** Hasil validasi satu sesi les. */
export interface ValidationResult {
  /** `true` jika semua aturan terpenuhi, `false` jika ada yang dilanggar. */
  isValid: boolean;
  /**
   * Pesan error yang ramah pengguna.
   * Hanya ada ketika `isValid` adalah `false`.
   */
  error?: string;
  /**
   * Kode aturan yang dilanggar.
   * Hanya ada ketika `isValid` adalah `false`.
   */
  ruleViolated?: ValidationRuleCode;
}

// ================================================================
// PARAMETER TYPE
// ================================================================

export interface ValidateSessionParams {
  /**
   * Daftar sesi yang sudah terjadwal milik siswa ini.
   * Digunakan untuk validasi kuota (B) dan overlap (C).
   */
  existingSessions: Session[];

  /**
   * Jumlah paket yang dimiliki siswa (4, 8, atau 12).
   * Digunakan untuk validasi kuota (B).
   */
  jumlahPaket: JumlahPaket;

  /**
   * Tanggal sesi baru dalam format ISO 8601: "YYYY-MM-DD".
   * @example "2025-08-25"
   */
  tanggalBaru: string;

  /**
   * Jam mulai sesi baru dalam format 24 jam: "HH:mm".
   * @example "14:00"
   */
  jamMulaiBaru: string;

  /**
   * Durasi sesi dalam menit (60, 90, atau 120).
   * Digunakan untuk menghitung jam selesai pada validasi overlap (C).
   */
  durasiMenit: number;

  /**
   * Materi atau topik sesi.
   * Tidak boleh kosong (Aturan D).
   */
  materi: string;
}

// ================================================================
// INTERNAL HELPER
// ================================================================

/**
 * Mengonversi string "HH:mm" menjadi objek Date pada tanggal tertentu.
 * Menggunakan date-fns `parse` agar timezone-aware dengan tanggal referensi.
 */
function parseTime(tanggal: string, jam: string): Date {
  // parse("14:00", "HH:mm", new Date("2025-08-25")) → Date object
  return parse(jam, "HH:mm", parseISO(tanggal));
}

// ================================================================
// MAIN FUNCTION
// ================================================================

/**
 * Memvalidasi sesi les baru terhadap empat aturan bisnis Edufio.
 *
 * Validasi dijalankan secara berurutan (fail-fast):
 * Aturan D → A → B → C
 *
 * Urutan ini dipilih agar error paling dasar (materi kosong, tanggal
 * tidak valid) muncul sebelum pengecekan yang lebih mahal (iterasi sesi).
 *
 * @param params - Parameter validasi, lihat `ValidateSessionParams`.
 * @returns `ValidationResult` — `{ isValid: true }` atau `{ isValid: false, error, ruleViolated }`.
 *
 * @example
 * const result = validateSession({
 *   existingSessions: siswa.sessions,
 *   jumlahPaket: siswa.jumlahPaket,
 *   tanggalBaru: "2025-08-25",
 *   jamMulaiBaru: "14:00",
 *   durasiMenit: 90,
 *   materi: "Matematika — Persamaan Kuadrat",
 * });
 *
 * if (!result.isValid) {
 *   console.error(result.error); // "Materi sesi tidak boleh kosong."
 * }
 */
export function validateSession(params: ValidateSessionParams): ValidationResult {
  const {
    existingSessions,
    jumlahPaket,
    tanggalBaru,
    jamMulaiBaru,
    durasiMenit,
    materi,
  } = params;

  // ------------------------------------------------------------------
  // ATURAN D — Materi Wajib Diisi
  // Dicek pertama karena ini validasi input paling dasar.
  // ------------------------------------------------------------------
  if (!materi || materi.trim().length === 0) {
    return {
      isValid: false,
      error: "Materi sesi tidak boleh kosong.",
      ruleViolated: "D",
    };
  }

  // ------------------------------------------------------------------
  // ATURAN A — Minimal H+3
  // Tanggal sesi harus minimal 3 hari setelah hari ini (per hari penuh,
  // bukan per jam), sehingga menggunakan startOfDay untuk perbandingan.
  // ------------------------------------------------------------------
  const today        = startOfDay(new Date());
  const minValidDate = addDays(today, 3);           // H+3, awal hari
  const tanggalSesi  = startOfDay(parseISO(tanggalBaru));

  const isDateValid =
    isAfter(tanggalSesi, minValidDate) || isEqual(tanggalSesi, minValidDate);

  if (!isDateValid) {
    // Format tanggal minimum ke "DD/MM/YYYY" untuk pesan yang ramah
    const dd   = String(minValidDate.getDate()).padStart(2, "0");
    const mm   = String(minValidDate.getMonth() + 1).padStart(2, "0");
    const yyyy = minValidDate.getFullYear();
    return {
      isValid: false,
      error: `Sesi hanya bisa dijadwalkan minimal H+3. Tanggal paling awal yang tersedia adalah ${dd}/${mm}/${yyyy}.`,
      ruleViolated: "A",
    };
  }

  // ------------------------------------------------------------------
  // ATURAN B — Kuota Paket
  // Jumlah sesi yang sudah ada + 1 tidak boleh melebihi jumlahPaket.
  // ------------------------------------------------------------------
  const totalSesiTerjadwal = existingSessions.length;
  if (totalSesiTerjadwal >= jumlahPaket) {
    return {
      isValid: false,
      error: `Kuota paket sudah penuh. Paket Anda memiliki ${jumlahPaket} sesi dan semua sudah terjadwal.`,
      ruleViolated: "B",
    };
  }

  // ------------------------------------------------------------------
  // ATURAN C — Cek Overlap
  // Hitung rentang waktu sesi baru, lalu bandingkan dengan sesi
  // yang sudah ada di tanggal yang sama.
  // Dua sesi dikatakan overlap jika: mulaiA < selesaiB && selesaiA > mulaiB
  // ------------------------------------------------------------------
  const newStart = parseTime(tanggalBaru, jamMulaiBaru);
  const newEnd   = addMinutes(newStart, durasiMenit);

  const sessionsOnSameDay = existingSessions.filter(
    (s) => s.tanggal === tanggalBaru
  );

  for (const existingSession of sessionsOnSameDay) {
    const existingStart = parseTime(existingSession.tanggal, existingSession.jamMulai);
    const existingEnd   = parseTime(existingSession.tanggal, existingSession.jamSelesai);

    // Overlap condition: newStart < existingEnd && newEnd > existingStart
    const isOverlapping =
      isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart);

    if (isOverlapping) {
      return {
        isValid: false,
        error: `Jadwal sesi bertabrakan dengan sesi yang sudah ada pada pukul ${existingSession.jamMulai}–${existingSession.jamSelesai}.`,
        ruleViolated: "C",
      };
    }
  }

  // ------------------------------------------------------------------
  // SEMUA ATURAN TERPENUHI
  // ------------------------------------------------------------------
  return { isValid: true };
}
