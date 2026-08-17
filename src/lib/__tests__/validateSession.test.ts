/**
 * @file validateSession.test.ts
 * @description Unit test untuk fungsi validateSession — mencakup semua aturan bisnis.
 *
 * Jalankan dengan: npx jest src/lib/__tests__/validateSession.test.ts
 */

import { addDays, format } from "date-fns";
import { validateSession } from "../validateSession";
import { JumlahPaket } from "@/types";
import type { Session } from "@/types";

// ================================================================
// HELPERS
// ================================================================

/** Tanggal H+3 (valid) dan H+4 (lebih aman) dalam format "YYYY-MM-DD" */
const dateHPlus3 = format(addDays(new Date(), 3), "yyyy-MM-dd");
const dateHPlus4 = format(addDays(new Date(), 4), "yyyy-MM-dd");
const dateHPlus2 = format(addDays(new Date(), 2), "yyyy-MM-dd"); // tidak valid

/** Buat sesi dummy dengan nilai default yang bisa di-override */
function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "ses-default",
    studentId: "stu-001",
    tanggal: dateHPlus3,
    jamMulai: "09:00",
    jamSelesai: "10:30",
    tempat: "Jl. Merdeka 10",
    materi: "Matematika",
    ...overrides,
  };
}

/** Base params yang valid untuk semua aturan */
const validParams = {
  existingSessions: [] as Session[],
  jumlahPaket: JumlahPaket.Paket8,
  tanggalBaru: dateHPlus4,
  jamMulaiBaru: "14:00",
  durasiMenit: 90,
  materi: "Fisika — Gerak Lurus",
};

// ================================================================
// ATURAN D — Materi Wajib
// ================================================================

describe("Aturan D — Materi Wajib", () => {
  test("FAIL: materi kosong (string kosong)", () => {
    const result = validateSession({ ...validParams, materi: "" });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("D");
    expect(result.error).toMatch(/materi/i);
  });

  test("FAIL: materi hanya whitespace", () => {
    const result = validateSession({ ...validParams, materi: "   " });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("D");
  });

  test("PASS: materi diisi dengan benar", () => {
    const result = validateSession({ ...validParams, materi: "Kimia Organik" });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

// ================================================================
// ATURAN A — Minimal H+3
// ================================================================

describe("Aturan A — Minimal H+3", () => {
  test("FAIL: tanggal H+2 (kurang dari 3 hari dari sekarang)", () => {
    const result = validateSession({ ...validParams, tanggalBaru: dateHPlus2 });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("A");
    expect(result.error).toMatch(/H\+3/i);
  });

  test("PASS: tanggal tepat H+3", () => {
    const result = validateSession({ ...validParams, tanggalBaru: dateHPlus3 });
    expect(result.isValid).toBe(true);
  });

  test("PASS: tanggal H+7 (lebih dari minimum)", () => {
    const dateHPlus7 = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const result = validateSession({ ...validParams, tanggalBaru: dateHPlus7 });
    expect(result.isValid).toBe(true);
  });
});

// ================================================================
// ATURAN B — Kuota Paket
// ================================================================

describe("Aturan B — Kuota Paket", () => {
  test("FAIL: sudah 4 sesi terjadwal, paket hanya 4", () => {
    const existingSessions = Array.from({ length: 4 }, (_, i) =>
      makeSession({ id: `ses-${i}`, tanggal: dateHPlus3 })
    );
    const result = validateSession({
      ...validParams,
      existingSessions,
      jumlahPaket: JumlahPaket.Paket4,
    });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("B");
    expect(result.error).toMatch(/kuota/i);
  });

  test("FAIL: sudah 8 sesi terjadwal, paket hanya 8", () => {
    const existingSessions = Array.from({ length: 8 }, (_, i) =>
      makeSession({ id: `ses-${i}` })
    );
    const result = validateSession({
      ...validParams,
      existingSessions,
      jumlahPaket: JumlahPaket.Paket8,
    });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("B");
  });

  test("PASS: sudah 7 sesi, paket 8 (masih ada 1 slot)", () => {
    const existingSessions = Array.from({ length: 7 }, (_, i) =>
      makeSession({ id: `ses-${i}` })
    );
    const result = validateSession({
      ...validParams,
      existingSessions,
      jumlahPaket: JumlahPaket.Paket8,
    });
    expect(result.isValid).toBe(true);
  });

  test("PASS: belum ada sesi sama sekali, paket 4", () => {
    const result = validateSession({
      ...validParams,
      existingSessions: [],
      jumlahPaket: JumlahPaket.Paket4,
    });
    expect(result.isValid).toBe(true);
  });
});

// ================================================================
// ATURAN C — Cek Overlap
// ================================================================

describe("Aturan C — Cek Overlap", () => {
  test("FAIL: sesi baru 14:00–15:30 overlap dengan sesi 14:30–16:00 (partial overlap awal)", () => {
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus4,
        jamMulai: "14:30",
        jamSelesai: "16:00",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "14:00",
      durasiMenit: 90,      // selesai 15:30
      existingSessions,
    });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("C");
    expect(result.error).toMatch(/bertabrakan/i);
  });

  test("FAIL: sesi baru 13:00–14:30 overlap dengan sesi 13:30–15:00 (partial overlap akhir)", () => {
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus4,
        jamMulai: "13:30",
        jamSelesai: "15:00",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "13:00",
      durasiMenit: 90,      // selesai 14:30
      existingSessions,
    });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("C");
  });

  test("FAIL: sesi baru 14:00–15:30 berada di tengah sesi 13:00–16:00 (contained)", () => {
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus4,
        jamMulai: "13:00",
        jamSelesai: "16:00",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "14:00",
      durasiMenit: 90,
      existingSessions,
    });
    expect(result.isValid).toBe(false);
    expect(result.ruleViolated).toBe("C");
  });

  test("PASS: sesi baru 16:00–17:30, sesi existing 14:00–15:30 (tidak overlap, berurutan)", () => {
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus4,
        jamMulai: "14:00",
        jamSelesai: "15:30",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "16:00",
      durasiMenit: 90,
      existingSessions,
    });
    expect(result.isValid).toBe(true);
  });

  test("PASS: sesi baru tepat mulai saat sesi existing selesai (15:30 → 15:30, boundary)", () => {
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus4,
        jamMulai: "14:00",
        jamSelesai: "15:30",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "15:30",
      durasiMenit: 60,      // selesai 16:30
      existingSessions,
    });
    expect(result.isValid).toBe(true);
  });

  test("PASS: sesi di tanggal berbeda tidak dianggap overlap", () => {
    // Existing di dateHPlus3, sesi baru di dateHPlus4
    const existingSessions = [
      makeSession({
        tanggal: dateHPlus3,
        jamMulai: "14:00",
        jamSelesai: "15:30",
      }),
    ];
    const result = validateSession({
      ...validParams,
      tanggalBaru: dateHPlus4,
      jamMulaiBaru: "14:00",
      durasiMenit: 90,
      existingSessions,
    });
    expect(result.isValid).toBe(true);
  });
});

// ================================================================
// HAPPY PATH — Semua aturan terpenuhi
// ================================================================

describe("Happy Path — Semua Aturan Valid", () => {
  test("PASS: sesi pertama yang benar-benar valid", () => {
    const result = validateSession(validParams);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.ruleViolated).toBeUndefined();
  });
});
