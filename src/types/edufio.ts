/**
 * @file edufio.ts
 * @description TypeScript type & interface definitions untuk domain Edufio.
 *
 * Semua tipe yang berhubungan dengan data siswa (Student) dan
 * sesi les (Session) didefinisikan di sini sebagai single source of truth.
 */

// ================================================================
// ENUMS
// ================================================================

/**
 * Program les yang tersedia di Edufio.
 */
export enum Program {
  LesPrivatSD  = "Les Privat SD",
  LesPrivatSMP = "Les Privat SMP",
  LesPrivatSMA = "Les Privat SMA",
}

/**
 * Pilihan jumlah paket sesi yang bisa dibeli siswa.
 */
export enum JumlahPaket {
  Paket4  = 4,
  Paket8  = 8,
  Paket12 = 12,
}

/**
 * Durasi per sesi dalam satuan menit.
 */
export enum DurasiPerSesi {
  Menit60  = 60,
  Menit90  = 90,
  Menit120 = 120,
}

/**
 * Mode belajar yang dipilih siswa.
 */
export enum ModeBelajar {
  TutorKeLokasi = "Tutor datang ke lokasi",
  Online        = "Online",
}

// ================================================================
// INTERFACES
// ================================================================

/**
 * Representasi data siswa (Student) dalam sistem Edufio.
 *
 * @example
 * const siswa: Student = {
 *   id: "stu-001",
 *   namaSiswa: "Budi Santoso",
 *   program: Program.LesPrivatSMP,
 *   jumlahPaket: JumlahPaket.Paket8,
 *   durasiPerSesi: DurasiPerSesi.Menit90,
 *   modeBelajar: ModeBelajar.TutorKeLokasi,
 * };
 */
export interface Student {
  /** Unique identifier siswa (UUID atau format lain). */
  id: string;

  /** Nama lengkap siswa. */
  namaSiswa: string;

  /** Program les yang diambil siswa. */
  program: Program;

  /** Total jumlah sesi dalam paket yang dibeli. */
  jumlahPaket: JumlahPaket;

  /** Durasi tiap sesi les dalam satuan menit. */
  durasiPerSesi: DurasiPerSesi;

  /** Mode belajar: tutor datang ke lokasi atau online. */
  modeBelajar: ModeBelajar;
}

/**
 * Representasi satu sesi les (Session) dalam sistem Edufio.
 *
 * @example
 * const sesi: Session = {
 *   id: "ses-001",
 *   studentId: "stu-001",
 *   tanggal: "2025-08-20",
 *   jamMulai: "14:00",
 *   jamSelesai: "15:30",
 *   tempat: "Jl. Merdeka No. 10, Jakarta",
 *   materi: "Matematika — Persamaan Kuadrat",
 * };
 */
export interface Session {
  /** Unique identifier sesi (UUID atau format lain). */
  id: string;

  /** Referensi ke Student.id, pemilik sesi ini. */
  studentId: string;

  /**
   * Tanggal sesi dalam format ISO 8601: "YYYY-MM-DD".
   * @example "2025-08-20"
   */
  tanggal: string;

  /**
   * Jam mulai sesi dalam format 24 jam: "HH:mm".
   * @example "14:00"
   */
  jamMulai: string;

  /**
   * Jam selesai sesi dalam format 24 jam: "HH:mm".
   * @example "15:30"
   */
  jamSelesai: string;

  /**
   * Tempat berlangsungnya sesi.
   * Bisa berupa alamat (Tutor ke lokasi) atau platform (Online, e.g. "Zoom").
   */
  tempat: string;

  /** Materi atau topik yang diajarkan pada sesi ini. */
  materi: string;
}

// ================================================================
// DERIVED / UTILITY TYPES
// ================================================================

/**
 * Payload untuk membuat siswa baru (tanpa field `id` yang di-generate server).
 */
export type CreateStudentPayload = Omit<Student, "id">;

/**
 * Payload untuk membuat sesi baru (tanpa field `id` yang di-generate server).
 */
export type CreateSessionPayload = Omit<Session, "id">;

/**
 * Payload untuk update parsial data siswa.
 */
export type UpdateStudentPayload = Partial<Omit<Student, "id">>;

/**
 * Payload untuk update parsial data sesi.
 */
export type UpdateSessionPayload = Partial<Omit<Session, "id">>;

/**
 * Student yang sudah di-join dengan array sesi-sesinya.
 * Berguna untuk tampilan profil siswa beserta riwayat sesi.
 */
export interface StudentWithSessions extends Student {
  sessions: Session[];
}

/**
 * Summary statistik paket siswa.
 */
export interface PackageSummary {
  studentId: string;
  totalSesi: JumlahPaket;
  sesiTerpakai: number;
  sesiTersisa: number;
}
