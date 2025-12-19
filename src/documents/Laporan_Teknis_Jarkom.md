# Laporan Pengembangan FINSIGHT: Tinjauan Sistem Jaringan Komputer

**Judul Project:** FINSIGHT (Financial Insight Dashboard)
**Fokus Laporan:** Implementasi Deployment, Arsitektur Kontainer, dan Komunikasi Jaringan.

---

## 1. Pendahuluan
Laporan ini merinci aspek teknis pengembangan aplikasi FINSIGHT yang berfokus pada mata kuliah Sistem Jaringan Komputer. Aplikasi ini dirancang menggunakan arsitektur *microservices* sederhana berbasis Docker, yang memungkinkan isolasi layanan, skalabilitas, dan kemudahan manajemen jaringan.

## 2. Arsitektur Deployment (Web Deployment)
Alih-alih menyatukan semua layanan dalam satu mesin bare-metal, kami menggunakan pendekatan **Containerization** dengan Docker.

### A. Environment Isolasi
Aplikasi dibagi menjadi tiga container utama yang berjalan secara terpisah namun saling terhubung:
1.  **Web Server (finsight_php)**:
    *   Container ini menjalankan Apache Web Server dan PHP 8.1.
    *   Bertindak sebagai *Application Layer* yang memproses logika bisnis dan melayani HTTP Request dari pengguna.
    *   Base Image: `php:8.1-apache`.
2.  **Database Server (finsight_mysql)**:
    *   Container khusus untuk penyimpanan data (Persistence Layer).
    *   Menggunakan MySQL 8.0.
    *   Terisolasi dari akses publik langsung demi keamanan.
3.  **Database Management (finsight_phpmyadmin)**:
    *   GUI untuk manajemen database.
    *   Bertindak sebagai client HTTP tambahan dalam jaringan.

### B. Konfigurasi Deployment (Docker Compose)
Seluruh deployment diorkestrasi menggunakan file `docker-compose.yml`. Hal ini mendemonstrasikan konsep **Infrastructure as Code (IaC)**, di mana konfigurasi jaringan dan layanan didefinisikan dalam kode.

---

## 3. Manajemen Jaringan & Komunikasi (Networking)

### A. Jaringan Internal (Bridge Network)
Docker secara default membuat jaringan bertipe `bridge` untuk project ini.
*   **Virtual Private Network**: Ketiga container di atas terhubung dalam satu subnet privat virtual (biasanya `172.18.0.0/16`).
*   **Isolasi**: Jaringan ini terisolasi dari jaringan host (laptop) dan jaringan publik internet, meningkatkan keamanan.

### B. Hubungan Antar Container (Inter-Container Communication)
Komunikasi antar container dalam jaringan bridge tidak menggunakan alamat IP statis (stateless), melainkan menggunakan **Service Discovery** berbasis DNS Internal Docker.

*   **Implementasi:**
    Web Server PHP menghubungi Database MySQL menggunakan *hostname* `mysql` (sesuai nama service di `docker-compose.yml`), bukan IP Address.
*   **Proses Resolusi DNS:**
    1.  PHP mengirim request koneksi ke host `mysql`.
    2.  Docker Embedded DNS Server menyelesaikan nama `mysql` menjadi IP Address privat milik container MySQL (misal: `172.18.0.3`).
    3.  Koneksi terbentuk secara internal di port 3306.

### C. Komunikasi Keluar (Exposing Ports & NAT)
Agar aplikasi dapat diakses oleh pengguna dari luar environment Docker (Host), kami menggunakan teknik **Port Mapping** yang bekerja mirip dengan NAT (Network Address Translation).

*   **Web Server**: Port `80` (Internal Container) dipetakan ke Port `8000` (Localhost).
    *   *Traffic Flow*: User -> `http://localhost:8000` -> Docker NAT -> `finsight_php:80`.
*   **Database**: Port `3306` dipetakan ke `3307` untuk akses debugging lokal, namun komunikasi aplikasi tetap menggunakan jalur internal port `3306`.

---

## 4. Keamanan Jaringan Aplikasi
1.  **Environment Variables (`.env`)**: Kredensial sensitif seperti `DB_PASSWORD` dan `JWT_SECRET` disimpan dalam variabel lingkungan, bukan *hardcoded* dalam kode sumber. Ini mencegah kebocoran informasi jika kode diakses pihak tidak berwenang.
2.  **JWT Authentication**: Keamanan sesi tidak bergantung pada server (stateless security) menggunakan JSON Web Token. Setiap request membawa token terenkripsi yang divalidasi server, mengurangi beban traffic session storage di jaringan.

---

## 5. Kesimpulan Teknis
Implementasi FINSIGHT mendemonstrasikan penerapan praktis konsep jaringan komputer modern:
*   **Virtualisasi Jaringan**: Menggunakan Docker Bridge.
*   **Client-Server Model**: Pemisahan Web Server dan Database Server.
*   **DNS Resolution**: Service discovery antar container.
*   **Port Forwarding/NAT**: Akses layanan privat melalui port publik.
