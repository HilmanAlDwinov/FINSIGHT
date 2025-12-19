# Catatan Perubahan Project FINSIGHT

Berikut adalah rincian perubahan yang dilakukan pada folder `src/documents` selama sesi pengembangan terakhir:

## 1. Pembaharuan `task.md`
File ini diperbarui untuk menyinkronkan status pengerjaan dengan kebutuhan di Product Requirements Document (PRD).
-   **Menambahkan Fitur yang Hilang dari PRD ke Fase 2:**
    -   `[ ] Wallet Transfer System` (Transfer antar dompet).
    -   `[ ] User Profile & Financial Goals` (Profil pengguna, pendapatan, tujuan keuangan).
    -   `[ ] Rule-Based Insights Engine` (Notifikasi cerdas tanpa AI).
-   **Update Status:** Menandai fitur "Wallet CRUD", "Transaction CRUD", dan "Budget System" sebagai selesai (`[x]`).

## 2. Pembuatan `Laporan_Persiapan_Presentasi.md`
File baru yang dibuat untuk kebutuhan presentasi mata kuliah "Sistem Jaringan Komputer".
-   **Isi Dokumen:**
    -   Topologi Server (Pemisahan Web Server & Database Server di Docker).
    -   Penjelasan Jaringan Private Docker (Bridge Network).
    -   Mekanisme resolusi DNS antar container.
    -   Daftar fitur yang sudah diimplementasikan (Auth, Wallets, Transactions, Budgets, Dashboard).

## 3. Peninjauan `finsight-prd.md`
-   File ini digunakan sebagai referensi utama untuk memverifikasi kelengkapan fitur di `task.md`, namun tidak ada perubahan konten yang dilakukan pada file ini.

## 4. Implementasi Fitur Wallet Transfer
Implementasi sistem transfer saldo antar dompet untuk memenuhi checklist fase 2.
-   **Backend**: 
    -   Pembuatan `TransferController.php` dengan logika transaksi ACID (Atomic).
    -   Penambahan rute `POST /transfers` di `index.php`.
-   **Frontend**: 
    -   Update `wallets.html` menambahkan tombol dan Modal Transfer.
    -   Update `wallets.js` untuk menangani logika formulir transfer dan refresh data otomatis.

Hari Jumat, 19 Desember 2025
## 5. Debugging dan Perbaikan Transfer Feature
Proses debugging untuk mengatasi masalah dropdown kosong pada modal transfer:
-   **Masalah Awal**: Dropdown "From Wallet" dan "To Wallet" tidak menampilkan daftar wallet yang tersedia.
-   **Root Cause**: Browser cache menyimpan versi lama dari `wallets.js`.
-   **Solusi**: 
    -   Menambahkan extensive logging untuk debugging (console.log di berbagai titik eksekusi).
    -   Memverifikasi bahwa semua element DOM ditemukan dengan benar.
    -   Memastikan event listener Bootstrap modal (`show.bs.modal`) terpasang dengan baik.
    -   User melakukan hard refresh (`Ctrl + F5`) untuk memuat file JavaScript terbaru.
-   **Hasil**: Fitur transfer berhasil berfungsi sempurna, dropdown terisi otomatis dengan data wallet dari database (Dana, OVO, BCA).

## 6. Pembuatan `Laporan_Teknis_Jarkom.md`
Dokumen teknis khusus untuk mata kuliah Sistem Jaringan Komputer yang menjelaskan:
-   Arsitektur deployment menggunakan Docker containers.
-   Manajemen jaringan dengan Docker Bridge Network.
-   Service Discovery menggunakan DNS internal Docker.
-   NAT dan Port Forwarding untuk akses eksternal.
