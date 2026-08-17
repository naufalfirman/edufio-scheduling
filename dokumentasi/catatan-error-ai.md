# Catatan Teknis: Evaluasi dan Perbaikan Bug AI

**Berkas:** `dokumentasi/catatan-error-ai.md`  
**Konteks:** Perbaikan logika *parsing* tanggal pada komponen kalender yang dapat memicu pergeseran zona waktu (*timezone shift*).

---

## 🐛 Deskripsi Bug
**Letak Kesalahan:** Terdapat penggunaan konstruktor bawaan `new Date(string)` untuk mengurai string tanggal berformat `YYYY-MM-DD` (contoh: `"2025-08-25"`) di dalam `Step2DatePicker.tsx` (baris 58) dan `Step3SessionDetail.tsx`. 

## 🔍 Analisis Kesalahan
Mengapa logika kode awal tersebut kurang tepat?
Berdasarkan spesifikasi ECMAScript, saat JavaScript menerima string berformat persis `YYYY-MM-DD` ke dalam `new Date()`, mesin JS (V8/Browser) akan **mengasumsikannya sebagai waktu UTC (*UTC midnight*)**, bukan waktu lokal. 

Sebagai contoh, `new Date("2025-08-25")` akan dieksekusi sebagai `2025-08-25T00:00:00.000Z`.
Jika aplikasi ini diakses oleh Admin atau Tutor yang berada di zona waktu *belakang* UTC (misalnya wilayah benua Amerika / UTC-5), maka konversi dari UTC ke waktu lokal peramban akan menarik tanggal mundur ke hari sebelumnya (misal menjadi `24 Agustus 2025 pukul 19:00`). Hal ini membuat komputasi fungsi `startOfDay()` menjadi meleset 1 hari. 

*(Catatan: Fungsi `validateSession.ts` sebelumnya aman karena sudah menggunakan `parseISO` dari `date-fns`, namun komponen UI terlewat menggunakan `new Date`).*

## 🚨 Dampak Bug
Jika bug ini lolos ke *production*:
1. **Kalender Meleset (Visual Error):** Titik biru penanda jadwal ("sudah ada sesi") di `Step2DatePicker` akan muncul pada **satu hari sebelum** hari yang seharusnya dipilih oleh Admin (jika Admin berada di zona waktu tertentu).
2. **Duplikasi Jadwal Tak Sengaja:** Admin dapat secara tidak sengaja mendaftarkan sesi di hari yang kelihatannya kosong di UI, namun secara *database* berujung pada tumpukan jadwal di tanggal yang salah.

## 🛠 Perbaikan Kode

Untuk mencegah JavaScript melakukan asums UTC secara sepihak, kita wajib secara eksplisit mengurai string tersebut menggunakan fungsi `parseISO` bawaan `date-fns` yang telah diimpor, karena fungsi ini menangani format ISO dengan lebih stabil, atau memecah komponen tanggalnya.

**Kode Sebelum Perbaikan (`Step2DatePicker.tsx`):**
```tsx
// ❌ Rawan Timezone Shift 
const sessionDates = useMemo(
  () => existingSessions.map((s) => startOfDay(new Date(s.tanggal))),
  [existingSessions]
);
```

**Kode Sesudah Perbaikan (`Step2DatePicker.tsx`):**
```tsx
import { parseISO, startOfDay } from 'date-fns';

// ✅ Menggunakan parseISO untuk stabilitas parsing
const sessionDates = useMemo(
  () => existingSessions.map((s) => startOfDay(parseISO(s.tanggal))),
  [existingSessions]
);
```

**Kode Sebelum Perbaikan (`Step3SessionDetail.tsx`):**
```tsx
// ❌ new Date(tanggal) rentan meleset harinya
const start = parse(jamMulai, 'HH:mm', new Date(tanggal));
```

**Kode Sesudah Perbaikan (`Step3SessionDetail.tsx`):**
```tsx
import { parseISO } from 'date-fns';

// ✅ Memakai parseISO
const start = parse(jamMulai, 'HH:mm', parseISO(tanggal));
```

**Pelajaran untuk AI System:** Selalu gunakan *helper* bawaan pustaka waktu (seperti `parseISO` atau `parse` dari `date-fns`) saat berinteraksi dengan tipe data Date dalam sistem yang mensyaratkan presisi kalender, ketimbang mengandalkan konstruktor *native* `new Date()` yang perilakunya bergantung pada mesin peramban dan sistem operasi.
