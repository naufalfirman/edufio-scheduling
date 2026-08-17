# Jurnal Percakapan AI — Proyek Edufio (Next.js)

Dokumen ini merangkum jejak instruksi utama dan keputusan teknis selama pengembangan prototipe aplikasi penjadwalan sesi les Edufio menggunakan kolaborasi AI.

## 📌 Prompt Utama 1: Fondasi Arsitektur & Desain Sistem

**Instruksi Pengguna:**
> *"Tolong bantu saya menyiapkan konfigurasi dasar: 1. Konfigurasi tailwind / CSS variables dengan palet warna custom Edufio (Teal, Navy, dll). 2. Buat TypeScript Interface / Type definition untuk data Student dan Session dengan struktur yang spesifik."*

**Respon & Solusi AI:**
- **Inisialisasi Proyek**: Membangun kerangka Next.js (App Router) modern. 
- **Tailwind CSS v4**: Mengambil keputusan arsitektural untuk mengonfigurasi palet warna Edufio *langsung* melalui direktif `@theme` di dalam file `globals.css`, menyesuaikan dengan standar terbaru Tailwind yang tidak lagi memerlukan file `tailwind.config.js`.
- **Single Source of Truth**: Menghasilkan struktur tipe data yang solid (*Enums* dan *Interfaces*) di dalam direktori `src/types/edufio.ts` untuk memastikan tidak ada kesalahan *typo* pada pemilihan program, paket, atau durasi sesi di seluruh komponen.

---

## 📌 Prompt Utama 2: Mesin Validasi Aturan Bisnis

**Instruksi Pengguna:**
> *"Buatkan fungsi helper TypeScript bernama validateSession di Next.js untuk memvalidasi pendaftaran sesi les. Aturan bisnis: A (Minimal H+3), B (Kuota Paket), C (Cek Overlap Jam pada hari yang sama), D (Materi Wajib)."*

**Respon & Solusi AI:**
- **Pemisahan Logika Bisnis (Separation of Concerns)**: Menciptakan modul independen `src/lib/validateSession.ts` agar logika tidak bercampur dengan komponen UI.
- **Fail-Fast Validation**: Mengurutkan eksekusi validasi secara cerdas (D → A → B → C) di mana validasi *input* dasar dicek terlebih dahulu sebelum komputasi iterasi kalender yang lebih berat.
- **Pemanfaatan `date-fns`**: Mengatasi kompleksitas zona waktu dan perbandingan *Boundary Jam* dengan metode presisi seperti `startOfDay` dan `isBefore`. 
- **Unit Testing Lintas Kasus**: Menulis dan memverifikasi **17 skenario *Unit Test*** via Jest untuk menjamin setiap aturan tidak bisa dibobol (*all tests passed*).

---

## 📌 Prompt Utama 3: Orkestrasi Antarmuka (Wizard) Mobile-First

**Instruksi Pengguna:**
> *"Buatkan komponen React Next.js bernama ScheduleWizard.tsx yang menangani 4 langkah antarmuka secara mobile-first: 1. Pendaftaran, 2. Pilih Tanggal (kalender sederhana H+3 disabled), 3. Detail Sesi (peringatan overlap kuning), 4. Ringkasan. Gunakan Tailwind CSS sesuai palet warna Edufio."*

**Respon & Solusi AI:**
- **Pola Desain Komponen Modular**: Memecah satu instruksi masif menjadi 5 komponen Reusable:
  1. `ScheduleWizard.tsx` sebagai Induk (*State Manager*).
  2. `Step1Registration.tsx` untuk masukan awal berbasis *toggle* interaktif.
  3. `Step2DatePicker.tsx` yang memuat mesin *custom calendar* dari nol.
  4. `Step3SessionDetail.tsx` yang terhubung secara *real-time* ke mesin validasi (menampilkan kotak peringatan kuning jika terdeteksi bentrok jadwal).
  5. `Step4Summary.tsx` untuk visualisasi persentase paket dan daftar sesi final dengan desain premium (*gradient background*).
- **Pendekatan *Responsive Card***: Menyusun tata letak *Phone Shell* yang mengapung di layar Desktop namun otomatis menjadi *full-screen* native saat diakses dari peramban ponsel.
