# FINSIGHT - AI-Powered Personal Finance Dashboard

Project Web Programming FINSIGHT yang bertujuan untuk membantu manajemen keuangan pribadi dengan fitur pencatatan transaksi, budgeting, dan analisis berbasis AI.

## 🚀 Fitur

-   **Dashboard Ringkasan**: Melihat total saldo, pemasukan, dan pengeluaran bulan ini.
-   **Manajemen Dompet (Wallets)**: Mendukung multiple wallets (e.g., Cash, Bank, E-Wallet) dengan saldo terpisah.
-   **Pencatatan Transaksi**: Catat pemasukan dan pengeluaran dengan kategori dan icon.
-   **Transfer Antar Dompet**: Pindahkan saldo antar rekening dengan mudah.
-   **Budgeting**: Atur batasan pengeluaran per kategori agar tidak boros.
-   **Financial Insights**: Analisis otomatis (Rule-Based) untuk memberikan peringatan budget dan saran hemat.
-   **Authentication**: Login dan Register aman dengan JWT.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5.
-   **Backend**: PHP 8.1 (Native MVC Pattern).
-   **Database**: MySQL 8.0.
-   **Infrastructure**: Docker & Docker Compose.
-   **Monitoring**: Nagios Core 4.x (optional).

## 📦 Cara Install & Jalankan

### Metode 1: Development (Localhost Only)

1.  **Clone Repository**
    ```bash
    git clone https://github.com/HilmanAlDwinov/FINSIGHT.git
    cd FINSIGHT
    ```

2.  **Jalankan dengan Docker**
   1 cd "D:\SMSTR 3\FINSIGHT\FINSIGHT\deployment\docker"
   2 docker-compose -f deployment\docker\docker-compose.local.yml --env-file deployment\docker\.env.local up -d
   3. untuk shutdownnya: docker-compose -f deployment\docker\docker-compose.local.yml --env-file deployment\docker\.env.local down

  The setup includes:
   - FINSIGHT application server
   - MySQL database
   - Nagios Core for monitoring
   - phpMyAdmin (optional)
   - DNS Server (BIND9) for local domain resolution (dapat dihentikan jika mengalami masalah di Windows)

  Make sure to check the README.md for complete instructions on configuring DNS resolution on client devices and accessing the
  services.


3.  **Akses Aplikasi**
    - Web App: `http://localhost`
    - phpMyAdmin: `http://localhost:8082` (port diubah dari 8080 ke 8082 untuk menghindari konflik)
    - Nagios Monitoring: `http://localhost:8081` (port diubah dari 8080 ke 8081 untuk menghindari konflik)

### Metode 2: Local Network (Untuk Expo/Demo) - Containerized Approach

1.  **Find Your IP Address**
    ```powershell
    .\deployment\scripts\get-local-ip.ps1
    ```

2.  **Configure Firewall**
    ```powershell
    # Run as Administrator
    .\deployment\scripts\configure-firewall.ps1
    ```

3.  **Start Docker Containers (with DNS and Monitoring)**
    ```powershell
    docker-compose -f deployment\docker\docker-compose.local.yml up -d
    ```

4.  **Configure DNS Resolution**
    - **Option A (Recommended):** Configure your device to use your laptop's IP as DNS server
    - **Option B (Alternative):** Edit hosts file manually:
      - Buka Notepad as Administrator
      - Edit `C:\Windows\System32\drivers\etc\hosts`
      - Tambahkan: `192.168.1.14  finsight.local` (ganti dengan IP Anda)
      - Save dan flush DNS: `ipconfig /flushdns`

5.  **Akses Aplikasi**
    - Via domain: `http://finsight.local` (jika DNS server berjalan)
    - Via IP: `http://192.168.1.14`
    - phpMyAdmin: `http://finsight.local:8082` atau `http://192.168.1.14:8082`
    - Nagios Monitoring: `http://finsight.local:8081` atau `http://192.168.1.14:8081` (username: nagiosadmin, password: nagios123)

### Containerized Monitoring with Nagios (Included in Docker Setup)

The local deployment now includes a fully containerized monitoring stack:
- **DNS Server:** BIND9 container for local domain resolution (dapat dihentikan jika mengalami masalah di Windows)
- **Monitoring:** Nagios Core container for application monitoring
- **Access:** Available at `http://finsight.local:8081/nagios` or `http://YOUR_IP:8081`
- **Credentials:** Username: `nagiosadmin`, Password: `nagios123`

## 🐳 Docker Container Management

### Build Container

Jika ingin membuild container secara manual:

```bash
# Build semua container (dari direktori deployment/docker)
cd deployment/docker
docker-compose -f docker-compose.local.yml build

# Build hanya container aplikasi
docker-compose -f docker-compose.local.yml build php-app

# Build hanya container database
docker-compose -f docker-compose.local.yml build mysql-db
```

### Menjalankan Container

Setelah container dibuild, Anda bisa menjalankan dengan beberapa cara:

```bash
# Menjalankan semua container di background
cd deployment/docker
docker-compose -f docker-compose.local.yml up -d

# Menjalankan semua container di foreground (untuk debugging)
docker-compose -f docker-compose.local.yml up

# Menjalankan container tertentu
docker-compose -f docker-compose.local.yml up -d php-app
docker-compose -f docker-compose.local.yml up -d mysql-db
docker-compose -f docker-compose.local.yml up -d nagios
docker-compose -f docker-compose.local.yml up -d phpmyadmin
```

### Shutdown Container

Untuk menghentikan dan membersihkan container:

```bash
# Hentikan semua container yang berjalan
cd deployment/docker
docker-compose -f docker-compose.local.yml down

# Hentikan container dan hapus volume (akan kehilangan data)
docker-compose -f docker-compose.local.yml down -v

# Hentikan container tertentu
docker-compose -f docker-compose.local.yml stop php-app
docker-compose -f docker-compose.local.yml stop mysql-db

# Hentikan semua container tanpa menghapus volume
docker-compose -f docker-compose.local.yml stop
```

### Manajemen Container Tambahan

Perintah tambahan untuk manajemen container:

```bash
# Cek status semua container
docker-compose -f docker-compose.local.yml ps

# Lihat log dari semua container
docker-compose -f docker-compose.local.yml logs

# Lihat log dari container tertentu
docker-compose -f docker-compose.local.yml logs php-app
docker-compose -f docker-compose.local.yml logs mysql-db

# Restart container
docker-compose -f docker-compose.local.yml restart php-app
docker-compose -f docker-compose.local.yml restart mysql-db

# Jalankan perintah di dalam container
docker-compose -f docker-compose.local.yml exec php-app bash
docker-compose -f docker-compose.local.yml exec mysql-db mysql -u root -p

# Hapus container dan build ulang
docker-compose -f docker-compose.local.yml up -d --build --force-recreate
```

## 📚 Dokumentasi Lengkap

- [Local DNS Setup Guide](docs/deployment/local-dns-setup.md)
- [Local Network Deployment](docs/deployment/local-network-deployment.md)
- [Nagios Installation Guide](docs/monitoring/nagios-windows-installation.md)
- [Expo Preparation Guide](docs/deployment/expo-preparation.md)
- [Network Troubleshooting](docs/troubleshooting/network-issues.md)

## ❓ Troubleshooting

### Aplikasi Tidak Bisa Diakses dari Device Lain

**Solusi:**
```powershell
# Configure firewall
.\deployment\scripts\configure-firewall.ps1

# Pastikan semua device di WiFi yang sama
# Gunakan IP langsung: http://192.168.1.14
```

### Database Connection Error

**Solusi:**
```powershell
# Restart containers
docker-compose -f deployment\docker\docker-compose.local.yml restart
```

### Port 3306/8080 Already in Use

**Solusi:**
- MySQL menggunakan port 3306 (internal container), akses eksternal mengikuti port yang tersedia
- Nagios menggunakan port 8081 (diubah dari 8080 untuk menghindari konflik)
- phpMyAdmin menggunakan port 8082 (diubah dari 8080 untuk menghindari konflik)
- Jika masih error karena port digunakan:
```powershell
Stop-Service MySQL80  # Jika menggunakan MySQL Windows service
```

### DNS Server Issues on Windows

**Solusi:** BIND9 container mengalami masalah mounting file di Windows:
1. Hentikan DNS server container: `docker-compose -f docker-compose.local.yml stop dns-server`
2. Akses aplikasi langsung via IP address: `http://192.168.1.14`
3. Alternatif, edit hosts file manual:
   - Edit `C:\Windows\System32\drivers\etc\hosts` as Administrator
   - Tambahkan: `192.168.1.14  finsight.local`
   - Flush DNS: `ipconfig /flushdns`

### Cek Status Aplikasi

```powershell
# Cek containers
docker ps

# Cek health
curl http://localhost/backend/health.php

# Cek database
docker exec finsight-mysql mysql -uroot -proot -e "SHOW DATABASES;"
```

## 🔧 Konfigurasi

### Database
- Host: `mysql-db`
- Database: `finsight_db`
- Username: `root`
- Password: `root`
- Port: `3307` (external), `3306` (internal)

### Ports
- **80**: Web Application
- **3306**: MySQL Database (internal container)
- **8081**: Nagios Monitoring
- **8082**: phpMyAdmin

### API
- Base URL: `http://localhost/backend/index.php`
- Health: `http://localhost/backend/health.php`

---

**Tim Pengembang**:
- Syarif Hidayatullah
- Hilman Al Dwinov
- Yossa Yudhistira Maulanda
- Primandaru Adi Damara
- Ibrahim Ivanka
- Muhammad Farid bin J
