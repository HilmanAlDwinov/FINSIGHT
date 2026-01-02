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

## 7. Implementasi Rule-Based Insights Engine
Fitur "Static AI" yang menganalisis data keuangan user dan memberikan insight otomatis:
-   **Backend**:
    -   Pembuatan `InsightController.php` dengan 4 algoritma analisis:
        1. **Budget Warnings**: Deteksi budget yang hampir/sudah terlampaui.
        2. **Spending Patterns**: Analisis pola pengeluaran weekend vs weekday.
        3. **Savings Opportunities**: Identifikasi kategori dengan pengeluaran tinggi.
        4. **Unusual Spending**: Deteksi lonjakan pengeluaran.
    -   Penambahan rute `GET /insights` di `index.php`.
-   **Frontend**:
    -   Pembuatan `insights.html` dengan layout card untuk menampilkan insights.
    -   Pembuatan `insights.js` untuk fetch dan render insights secara dinamis.
    -   Penambahan menu "Insights" di sidebar navigasi.

## 8. Perbaikan CSS Path pada Insights Page
-   **Masalah**: Sidebar tidak ter-render dengan styling yang benar pada halaman Insights.
-   **Solusi**: Memperbaiki path CSS di `insights.html` menjadi `../assets/css/sidebar.css`.

## 9. Penyesuaian Algoritma Insights (Test Data Improvement)
-   **Masalah**: Insights tidak muncul saat data tes masih sedikit atau belum memenuhi threshold ketat, atau saat user hanya mengisi pengeluaran saja (tanpa pemasukan).
-   **Solusi**: 
    -   Menambahkan **Financial Health Summary** yang *selalu* muncul sebagai fallback.
    -   Menurunkan threshold trigger agar lebih responsif terhadap data testing.
    -   Menambahkan handling khusus untuk **"Hanya Pengeluaran"** di summary, agar pengguna baru yang belum mencatat pemasukan tetap mendapat notifikasi relevan.
-   **Hasil**: Halaman Insights lebih robust dan informatif untuk berbagai kondisi data user.

## 10. Debugging Data Integrity
-   Pembuatan `diagnostic.php` untuk memverifikasi isi database, validitas User ID, dan integritas Foreign Key (hubungan antar tabel).
-   Alat ini digunakan untuk memastikan data transaksi benar-benar tersimpan di database sebelum dianalisis oleh Insights Engine.

## 11. Implementasi Dashboard Visualization (Phase 4)
Menambahkan grafik interaktif untuk memenuhi gap analysis visualisasi data.
-   **Library**: Menggunakan `Chart.js` (via CDN) untuk rendering grafik yang ringan dan responsif.
-   **Implementasi**:
    -   **Frontend HTML**: Menambahkan elemen `<canvas>` di `dashboard.html` di bawah kartu statistik.
    -   **Frontend JS**: Menambahkan logika agregasi data bulanan (6 bulan terakhir) di `dashboard.js`.
    -   **Visual**: Grafik garis (Line Chart) membandingkan Income vs Expense dengan area fill gradient.
-   **Outcome**: User dapat melihat tren arus kas (Cashflow) secara visual, meningkatkan "premium feel" aplikasi.

## 12. Setup DNS Lokal dan Nagios Monitoring untuk Expo/Demo
Implementasi infrastruktur deployment dan monitoring untuk presentasi expo menggunakan local network.

### Struktur Folder Baru
-   **`deployment/`**: Folder untuk konfigurasi deployment
    -   `dns/`: Konfigurasi DNS lokal (dnsmasq, hosts file)
    -   `docker/`: Docker Compose untuk local network
    -   `scripts/`: Script otomasi (firewall, IP detection, Nagios installation)
-   **`monitoring/`**: Folder untuk Nagios monitoring
    -   `nagios-configs/`: Konfigurasi Nagios (hosts, services, contacts)
    -   `checks/`: Custom monitoring check scripts
-   **`docs/`**: Dokumentasi lengkap
    -   `deployment/`: Panduan deployment (DNS, network, expo)
    -   `monitoring/`: Panduan Nagios
    -   `troubleshooting/`: Panduan troubleshooting

### File Konfigurasi DNS
-   **`deployment/dns/dnsmasq.conf`**: Konfigurasi DNS server lokal untuk domain `finsight.local`
-   **`deployment/dns/hosts.example`**: Template manual hosts file sebagai alternatif dnsmasq

### File Konfigurasi Docker
-   **`deployment/docker/docker-compose.local.yml`**: Docker Compose untuk local network deployment dengan health checks
-   **`deployment/docker/.env.local.example`**: Template environment variables untuk deployment lokal

### Script Otomasi
-   **`deployment/scripts/configure-firewall.ps1`**: Script PowerShell untuk konfigurasi Windows Firewall (port 80, 443, 3306, 8080)
-   **`deployment/scripts/get-local-ip.ps1`**: Script untuk mendeteksi IP address laptop di WiFi
-   **`deployment/scripts/install-nagios-wsl.sh`**: Script instalasi Nagios Core 4.x di WSL2 Ubuntu
-   **`deployment/scripts/configure-monitoring.sh`**: Script untuk setup monitoring FINSIGHT di Nagios

### Konfigurasi Nagios
-   **`monitoring/nagios-configs/hosts/finsight-local.cfg`**: Definisi host untuk monitoring
-   **`monitoring/nagios-configs/services/docker-services.cfg`**: Monitoring Docker containers (app, mysql, phpmyadmin)
-   **`monitoring/nagios-configs/services/mysql-services.cfg`**: Monitoring MySQL database (connection, size, performance)
-   **`monitoring/nagios-configs/services/web-services.cfg`**: Monitoring web services (HTTP, API health, response time)
-   **`monitoring/nagios-configs/contacts/contacts.cfg`**: Konfigurasi kontak untuk alert notifications

### Custom Monitoring Checks
-   **`monitoring/checks/check_docker_service.sh`**: Check Docker daemon status
-   **`monitoring/checks/check_docker_containers.sh`**: Check status container Docker individual
-   **`monitoring/checks/check_mysql_finsight.sh`**: Check MySQL database health (size, performance)
-   **`monitoring/checks/check_finsight_api.sh`**: Check FINSIGHT API health dan response time

### API Health Endpoint
-   **`src/backend/health.php`**: Endpoint health check untuk Nagios monitoring
    -   Memeriksa koneksi database
    -   Memeriksa file system
    -   Memeriksa PHP version dan extensions
    -   Return HTTP 200 jika healthy, 500 jika unhealthy

### Dokumentasi Lengkap
-   **`docs/deployment/local-dns-setup.md`**: Panduan setup DNS lokal (dnsmasq dan manual hosts file)
-   **`docs/deployment/local-network-deployment.md`**: Panduan deployment di local network dengan troubleshooting
-   **`docs/deployment/expo-preparation.md`**: Checklist persiapan expo lengkap dengan demo flow dan backup plan
-   **`docs/monitoring/nagios-windows-installation.md`**: Panduan instalasi Nagios di WSL2 dengan troubleshooting
-   **`docs/troubleshooting/network-issues.md`**: Panduan troubleshooting masalah network

### Fitur Utama
-   ✅ **Local DNS**: Akses aplikasi via `finsight.local` domain di local network
-   ✅ **Docker Deployment**: Containerized deployment dengan health checks
-   ✅ **Nagios Monitoring**: Real-time monitoring untuk Docker, MySQL, dan Web services
-   ✅ **Custom Checks**: Plugin monitoring khusus untuk FINSIGHT
-   ✅ **Firewall Automation**: Script otomatis untuk konfigurasi Windows Firewall
-   ✅ **Dokumentasi Lengkap**: Panduan step-by-step untuk deployment dan troubleshooting
-   ✅ **Expo Ready**: Checklist dan panduan lengkap untuk presentasi expo

### Perbaikan dan Penyesuaian
-   **MySQL Port**: Diubah dari 3306 ke 3307 untuk menghindari konflik dengan MySQL Windows service
-   **Nagios MySQL Check**: Diupdate untuk menggunakan port 3307
-   **Script Path Handling**: Diperbaiki quoting di `configure-monitoring.sh` untuk handle path dengan spasi
-   **GitIgnore**: Diupdate untuk mengabaikan `.env.local` tapi tetap commit `.env.local.example`

docker-compose -f deployment\docker\docker-compose.local.yml down

## 13. Perbaikan Konfigurasi Docker Compose untuk Lingkungan Windows
Perubahan konfigurasi Docker Compose untuk mengatasi masalah deployment di lingkungan Windows:

### Masalah yang Dihadapi:
-   **Port Conflict**: Port 3306 dan 8080 terdeteksi sudah digunakan oleh layanan lain (XAMPP, aplikasi lain)
-   **DNS Server Issues**: Container BIND9 mengalami masalah mounting file di Windows (permission error)
-   **File Permission Error**: Error "Device or resource busy" saat mengakses file konfigurasi BIND9

### Solusi yang Diterapkan:
-   **Perubahan Port MySQL**: Mengganti port eksternal MySQL dari 3306 ke port yang tersedia
-   **Perubahan Port Nagios**: Mengganti port Nagios dari 8080 ke 8081
-   **Perubahan Port phpMyAdmin**: Mengganti port phpMyAdmin dari 8080 ke 8082
-   **Penghentian Sementara DNS Server**: Menghentikan service dns-server karena masalah kompatibilitas Windows
-   **Update Dokumentasi**: Memperbarui README.md dengan instruksi deployment yang lebih jelas

### Konfigurasi Akhir:
-   **Main Application**: Port 80 (localhost)
-   **MySQL Database**: Port 3306 (internal container), akses eksternal sesuai port yang tersedia
-   **Nagios Monitoring**: Port 8081
-   **phpMyAdmin**: Port 8082

### Hasil:
-   ✅ Semua layanan utama berjalan dengan lancar (app, mysql, nagios, phpmyadmin)
-   ✅ Tidak ada konflik port
-   ✅ Aplikasi dapat diakses melalui localhost
-   ✅ Database connection berfungsi dengan baik
-   ✅ Health check endpoint berjalan normal
