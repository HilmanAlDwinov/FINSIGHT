# Persiapan Presentasi - Pengembangan Aplikasi Berbasis Web (PABW)
## FINSIGHT - Financial Assistant & Tracker

Dokumen ini berisi poin-poin kunci untuk presentasi tugas besar mata kuliah PABW. Fokus utama adalah pada implementasi **Frontend**, **Backend**, dan **Database**.

---

### 1. Deskripsi Proyek (Overview)
**FINSIGHT** adalah aplikasi web manajemen keuangan pribadi yang cerdas. Aplikasi ini membantu pengguna melacak pemasukan, pengeluaran, dan anggaran, serta menyediakan **Asisten AI** untuk konsultasi keuangan secara real-time.

*   **Tujuan utama**: Mempermudah pencatatan keuangan dan memberikan literasi keuangan melalui AI.
*   **Target Pengguna**: Mahasiswa, pekerja muda, dan siapa saja yang ingin mengatur keuangan mereka.

---

### 2. Arsitektur Aplikasi (Tech Stack)

#### **A. Frontend (Sisi Klien)**
*   **Teknologi**: HTML5, CSS3, JavaScript (Vanilla).
*   **Lokasi Kode**: `src/Frontend`
*   **Komponen Utama**:
    *   **Pages**: `landingpage.html`, `dashboard.html` (Landing page dan Dashboard utama).
    *   **Logic (`/js`)**: Menangani interaksi user, fetch API ke backend, dan manipulasi DOM.
    *   **Chat Widget**: Komponen antarmuka untuk berinteraksi dengan AI Assistant.
    *   **Visualisasi**: Grafik keuangan (menggunakan library charting seperti Chart.js - *jika digunakan*).

#### **B. Backend (Sisi Server)**
*   **Teknologi**: PHP 8.1 (Native/Custom MVC Pattern).
*   **Lokasi Kode**: `src/backend`
*   **Struktur MVC**:
    *   **Routes**: Mengatur endpoint API (RESTfull API).
    *   **Controllers** (`src/backend/controllers`): Logika bisnis utama (Contoh: `AiController.php`, `AuthController.php`).
    *   **Services** (`src/backend/services`): Layanan eksternal seperti `OpenAIService.php` untuk integrasi LLM.
    *   **Models** (`src/backend/models`): Interaksi langsung dengan database.

#### **C. Database**
*   **Teknologi**: MySQL 8.0
*   **Lokasi Kode**: `src/database`
*   **Struktur Normalisasi**: Database relasional yang terstruktur.

---

### 3. Penjelasan Database (Schema)
Jelaskan struktur tabel utama untuk menunjukkan pemahaman normalisasi data:

1.  **Users & Profil**:
    *   `users`: Menyimpan kredensial login (email, hash password).
    *   `user_settings`: Preferensi user (dark mode, currency).
    *   `user_profiles`: Data finansial user (gaji bulanan, tujuan keuangan).
2.  **Keuangan Inti**:
    *   `wallets`: Dompet/Rekening (Cash, Bank, E-Wallet).
    *   `categories`: Kategori pemasukan/pengeluaran (Makan, Transport, Gaji).
    *   `transactions`: Mencatat setiap arus uang masuk/keluar. Relasi ke `users`, `wallets`, dan `categories`.
3.  **Perencanaan**:
    *   `budgets`: Anggaran per kategori untuk membatasi pengeluaran.
    *   `wallet_transfers`: Mencatat pemindahan dana antar dompet.

---

### 4. Fitur Unggulan (Key Features)

#### **1. AI Financial Assistant**
*   **Cara Kerja**: User mengirim pertanyaan via Chat Widget -> Frontend kirim request ke Backend -> `AiController` memanggil `OpenAIService` -> Respon dikirim kembali.
*   **Konteks Cerdas**: AI tidak hanya menjawab umum, tetapi diberikan konteks data keuangan user (saldo, pengeluaran terakhir) agar saran yang diberikan personal.

#### **2. Manajemen Transaksi & Multi-Wallet**
*   User bisa membuat banyak dompet (contoh: "Dompet Utama", "Tabungan Bank").
*   Mencatat transaksi income/expense secara detail.

#### **3. Dashboard & Monitoring**
*   Ringkasan keuangan pengguna ditampilkan dalam satu halaman yang intuitif.

---

### 5. Alur Demonstrasi (Demo Flow)
Berikut adalah saran urutan saat mendemokan aplikasi:

1.  **Register/Login**: Tunjukkan validasi form dan proses masuk ke sistem.
2.  **Landing Page**: Sekilas tampilan awal aplikasi.
3.  **Dashboard**: Tunjukkan saldo total dan grafik ringkasan.
4.  **Input Transaksi**:
    *   Tambah transaksi pengeluaran baru.
    *   Tunjukkan saldo dompet berkurang secara otomatis.
5.  **AI Chat**:
    *   Buka widget chat.
    *   Tanya: *"Bagaimana kondisi keuanganku bulan ini?"*
    *   Jelaskan bahwa AI menjawab berdasarkan data yang baru saja diinput.
6.  **Database (Opsional)**: Tunjukkan sekilas tabel `transactions` di phpMyAdmin untuk membuktikan data masuk.

---

### 6. Deployment (Sekilas)
*   Aplikasi dibungkus menggunakan **Docker Container**.
*   Terdapat container terpisah untuk `Application` (PHP+Apache) dan `Database` (MySQL).
*   Deployment dilakukan dengan `docker-compose` untuk kemudahan setup, namun poin ini hanya sebagai tambahan nilai plus (portabilitas).

---

### Penutup
FINSIGHT bukan sekadar pencatat keuangan, tetapi sistem cerdas yang menggabungkan manajemen data yang rapi (Backend/DB) dengan pengalaman pengguna yang modern (Frontend/AI).
