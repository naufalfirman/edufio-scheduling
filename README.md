# Edufio — Penjadwalan Sesi Les (Next.js)

Aplikasi *mobile-first* untuk mengatur penjadwalan sesi les privat, dibuat sebagai Tes Teknis Frontend untuk Edufio. Aplikasi ini membantu Admin untuk mendaftarkan data siswa, mengalokasikan tanggal dari kalender, serta menetapkan detail sesi dengan peringatan bentrok jadwal secara *real-time*.

## 🚀 Cara Menjalankan Aplikasi

Pastikan sistem Anda sudah terinstal **Node.js** (rekomendasi versi 18.x atau terbaru).

1. Buka terminal dan pastikan Anda berada di direktori proyek ini (`edufio-nextjs`).
2. Instal seluruh dependensi yang dibutuhkan:
   ```bash
   npm install
   ```
3. Jalankan *development server*:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) atau  https://edufio-testskill.nfh.my.id di peramban (browser) Anda. Sangat disarankan untuk menggunakan fitur *Responsive Design Mode / Device Toolbar* di peramban Anda untuk pengalaman *mobile-first* yang optimal sesuai desain.

## 🧠 Asumsi & Keputusan Mandiri

Dalam proses pengerjaan tes ini, terdapat beberapa keputusan teknis dan asumsi yang saya buat:

1. **Pemilihan Stack (Next.js + Tailwind CSS)**: 
   Meskipun instruksi ini adalah *mini-app*, Next.js (App Router) dipilih karena skalabilitasnya serta ekosistem React yang solid. Tailwind CSS v4 digunakan memanfaatkan fitur `@theme` baru untuk mendefinisikan seluruh palet warna Edufio (*Primary Teal*, *Dark Navy*, dsb.) langsung sebagai utilitas, meminimalisir penulisan CSS statis.
2. **Pengelolaan State**: 
   Data siswa dan riwayat sesi yang sedang dibuat disimpan menggunakan *React Local State* murni di dalam satu komponen utama (`ScheduleWizard`). Saya belum menggunakan *LocalStorage* karena aplikasi difokuskan pada pengujian *flow*. Namun, untuk versi rilis, transisi ke arsitektur penyimpanan (seperti *Zustand* + *LocalStorage*) sangat dianjurkan.
3. **Penanganan Zona Waktu (Timezone) dan Tanggal**: 
   Operasi tanggal (H+3 rule, deteksi *overlap*) sepenuhnya di-*handle* oleh *library* `date-fns` di sisi klien. Perhitungan minimal batas hari (H+3) menggunakan `startOfDay` agar mengacu pada hari secara penuh, menghindari *bug offset* jam.
4. **Boundary Case Overlap Jadwal**: 
   Diasumsikan bahwa jika Sesi A selesai tepat pada pukul 15:30, maka Sesi B boleh dimulai persis pukul 15:30 tanpa dianggap bentrok (overlap). Ini umum terjadi pada jam pergantian kelas les.

## 💡 Kritik & Masukan Terhadap Brief

*Wireframe* 4-langkah (*wizard*) yang diberikan sudah sangat runut secara logika aplikasi. Namun, ada potensi untuk menyederhanakannya demi efisiensi Admin:

*   **Proses Input Berulang yang Melelahkan (Friction)**: 
    Jika Admin perlu memasukkan paket 12 sesi, kembali dari Langkah 4 ke Langkah 2 secara berulang (12 kali putaran kalender → jam → simpan) akan memakan banyak waktu.
*   **Saran Optimalisasi**: 
    Langkah 2 dan Langkah 3 dapat dilebur. Setelah mendaftarkan anak (Step 1), tampilkan *interface "Batch Scheduling"*. Admin bisa *tap* banyak tanggal secara instan di satu kalender, dan tepat di bawah kalender muncul deretan *slot* jam dan input materi untuk tanggal-tanggal yang baru saja dipilih.
*   **Akses Edit di Akhir**: 
    Di ringkasan (Langkah 4), akan sangat bermanfaat jika ditambahkan opsi "Ubah Jam" atau "Hapus" pada tiap sesi, daripada terpaksa membatalkan semua (atau tidak bisa meralat).

## 📅 Rencana 3 Hari Ke Depan (Fitur Tambahan)

Jika diberikan *timeline* ekstra (misal: 3 hari kerja penuh), berikut adalah fitur lanjutan yang akan saya bangun untuk menyempurnakan purwarupa ini:

1. **Sinkronisasi Google Calendar (Sync)**: 
   Menambahkan integrasi dengan API Google Calendar atau minimal kemampuan mengunduh fail `.ics` di akhir proses, sehingga Admin dapat menyalin *event* ini ke kalender Tutor/Siswa secara instan.
2. **Ekspor Jadwal ke PDF & WhatsApp Format**: 
   Di halaman Ringkasan (Langkah 4), menambahkan tombol "Bagikan Jadwal". Fitur ini akan menghasilkan format teks *Markdown-style* ramah aplikasi pesan instan (WhatsApp) yang berisi rincian tanggal, jam, dan tutor untuk diteruskan ke orang tua siswa, atau men-*generate* PDF resmi.
3. **Auto-Save Draft (LocalStorage)**: 
   Menerapkan penyimpanan *draft* otomatis berbasis IndexedDB / LocalStorage, sehingga jika peramban Admin *crash* atau tertutup tak sengaja pada sesi ke-7, data 6 sesi sebelumnya tidak hilang.
4. **Integrasi Data Historis Konflik Tutor**: 
   Mensimulasikan panggilan API ke *backend* saat mengisi "Jam Mulai" untuk mendeteksi apakah **Tutor X** sedang bertugas di lokasi lain pada jam yang sama (saat ini *overlap* hanya dicek terhadap jadwal siswa yang sama).
