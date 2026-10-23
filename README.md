# 🚀 BlitzHire - Modern Applicant Tracking System (ATS) & Job Portal

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12%2F13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/SQLite-Supported-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

**BlitzHire** adalah platform *Applicant Tracking System* (ATS) dan portal lowongan kerja modern yang dirancang untuk menghubungkan perusahaan dengan talenta terbaik. Aplikasi ini dibangun menggunakan arsitektur monolitik modern berbasis **Laravel** dan **Inertia.js + React**, memberikan pengalaman Single Page Application (SPA) yang cepat, interaktif, dan mulus tanpa mengorbankan kemudahan ekosistem backend Laravel.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Direktori](#-struktur-direktori)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Panduan Instalasi](#-panduan-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Akun Uji Coba (Demo Credentials)](#-akun-uji-coba-demo-credentials)
- [Rute & Navigasi Utama](#-rute--navigasi-utama)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 1. 🌐 Portal Publik & Job Board
- **Landing Page Interaktif**: Menampilkan statistik lowongan aktif, jumlah talenta diterima, lowongan full-time, magang/PKL, serta cuplikan lowongan terbaru.
- **Pencarian & Eksplorasi Lowongan (`/jobs`)**: Filter pekerjaan berdasarkan departemen, tipe pekerjaan (*Full-Time*, *Hybrid*, *Contract*, *Magang/PKL*), dan kisaran gaji.
- **Detail Lowongan (`/jobs/{id}`)**: Informasi kualifikasi lengkap, deskripsi pekerjaan, rentang gaji, dan tombol lamar cepat.

### 2. 👨‍💼 Portal Pelamar / Kandidat (`/kandidat/login`)
- **Autentikasi Mandiri**: Registrasi akun pelamar baru dan login aman dengan session guard terpisah (`auth:pelamar`).
- **Dashboard Pelamar**:
  - Pelacakan status lamaran secara real-time (*Screening*, *Wawancara*, *Penawaran/Offer*, *Diterima*, *Ditolak*).
  - Upload dan pengelolaan berkas pendukung (CV/Resume, Portofolio, Dokumen Pendukung).
  - Konfirmasi jadwal wawancara atau pengajuan jadwal ulang (*reschedule request*).
  - Tinjau dan respon penawaran kerja (*Accept / Reject Offer*).
  - Unduh Surat Keputusan (SK) resmi setelah diterima.

### 3. 🏢 Portal HRD / Rekruter (`/hrd-login`)
- **Autentikasi Khusus HRD**: Guard login khusus tim Human Resource (`auth:hrd`).
- **Dashboard Analitik**: Metrik total kandidat, lowongan aktif, tahapan pipeline rekrutmen.
- **Kelola Lowongan (`/hrd/kelola-job`)**:
  - Publikasi lowongan baru dengan spesifikasi kualifikasi, deskripsi, lokasi, rentang gaji, dan tanggal periode.
  - Perubahan status lowongan (Aktif / Ditutup).
- **Manajemen Kandidat & Pipeline**:
  - Daftar pelamar per posisi dengan kalkulasi skor kecocokan (*skor_kecocokan*).
  - Detail profil kandidat, histori pendidikan, kontak, dan pratinjau CV.
  - Alur seleksi terpadu: Screening ➔ Penjadwalan Wawancara ➔ Hasil Evaluasi ➔ Tahap Offering ➔ Final Keputusan (Diterima/Ditolak).
  - Fitur penjadwalan wawancara (Online via Google Meet / Offline, tanggal, pewawancara).
  - Manajemen Surat Penawaran (*Offering Letter*) beserta nominal gaji dan tanggal mulai kerja.
- **Konfigurasi Penilaian**: Pengaturan bobot penilaian seleksi kandidat.
- **Laporan Rekrutmen**: Laporan data pelamar, jadwal wawancara, dan rekap kandidat yang diterima.

---

## 🛠 Teknologi yang Digunakan

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Backend** | PHP 8.3+, Laravel 12/13 | Framework backend yang tangguh, aman, dan ekspresif |
| **Adapter SPA** | Inertia.js v2 | Menghubungkan Laravel & React tanpa membuat REST API terpisah |
| **Frontend** | React 18, JSX | Komponen UI modular dan reaktif |
| **Styling** | Tailwind CSS v3, PostCSS | Utility-first CSS untuk desain modern dan responsif |
| **UI Components** | Headless UI | Komponen aksesibel untuk modal, dropdown, dan transisi |
| **Bundler** | Vite 8 + Laravel Vite Plugin | Hot Module Replacement (HMR) super cepat saat development |
| **Database** | SQLite (Default) / MySQL | Penyimpanan data relasional |
| **Routing Helper** | Ziggy | Panggilan rute Laravel `route('name')` langsung di React |

---

## 📁 Struktur Direktori

```text
blitzhire/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                  # Kontroler Auth HRD & Pelamar terpisah
│   │   │   ├── HRDController.php      # Dashboard & manajemen umum HRD
│   │   │   ├── HRDCandidateController.php # Manajemen alur seleksi kandidat
│   │   │   ├── JobController.php      # CRUD & penampilan lowongan
│   │   │   ├── LamaranDetailController.php # Detail lamaran, wawancara, & offer
│   │   │   ├── PelamarController.php  # Dashboard & interaksi pelamar
│   │   │   └── ReportController.php   # Laporan rekrutmen
│   └── Models/                        # HRD, Pelamar, Lowongan, Lamaran, dll.
├── database/
│   ├── migrations/                    # Skema tabel database
│   ├── seeders/DatabaseSeeder.php     # Data awal (sample jobs, kandidat, demo login)
│   └── database.sqlite                # File database default
├── resources/
│   ├── js/
│   │   ├── Components/                # Komponen UI reusable (Button, Modal, Card, dll.)
│   │   ├── Layouts/                   # Template layout aplikasi
│   │   ├── Pages/                     # Halaman React yang dirender oleh Inertia
│   │   │   ├── Auth/                  # Halaman Login/Register HRD & Pelamar
│   │   │   ├── HRD/                   # Halaman portal HRD & seleksi kandidat
│   │   │   ├── Jobs/                  # Halaman list & detail lowongan publik
│   │   │   ├── Pelamar/               # Halaman dashboard pelamar
│   │   │   └── Public/                # Landing page publik
│   │   └── app.jsx                    # Entry point aplikasi frontend
│   └── css/app.css                    # Styling utama Tailwind
├── routes/
│   ├── web.php                        # Rute aplikasi utama (Publik, HRD, Pelamar)
│   └── auth.php                       # Rute autentikasi multi-guard
└── vite.config.js                     # Konfigurasi build Vite & React plugin
```

---

## 💻 Prasyarat Sistem

Sebelum memulai instalasi, pastikan komputer Anda telah terpasang:
- **PHP** versi `>= 8.2` (Direkomendasikan PHP 8.3+) dengan ekstensi: `pdo_sqlite`, `curl`, `mbstring`, `fileinfo`.
- **Composer** versi `>= 2.5`
- **Node.js** versi `>= 18.x` atau `>= 20.x`
- **NPM** versi `>= 9.x`

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah berikut untuk menginstal proyek dari awal:

### 1. Masuk ke Direktori Proyek
Pastikan terminal berada di dalam direktori `blitzhire`:
```bash
cd blitzhire
```

### 2. Pasang Dependensi Backend (PHP)
```bash
composer install
```

### 3. Pasang Dependensi Frontend (Node.js)
```bash
npm install
```

### 4. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` ke `.env` jika belum ada:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS / Git Bash
cp .env.example .env
```

Buat kunci aplikasi (*App Key*):
```bash
php artisan key:generate
```

### 5. Setup Database & Seeding Data
Secara default, proyek menggunakan **SQLite**. Buat file database jika belum tersedia, lalu jalankan migrasi dan seeder:

```bash
# Buat file database.sqlite (jika belum ada)
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"

# Jalankan migrasi dan isi data dummy
php artisan migrate --seed
```

> 💡 **Info**: Seeder ini secara otomatis menyiapkan lowongan pekerjaan aktif, data pelamar contoh, status tahapan seleksi, dan akun demo.

### 6. Tautkan Storage (Symlink)
Untuk memastikan dokumen atau CV yang diunggah dapat diakses dengan baik:
```bash
php artisan storage:link
```

---

## 🏃 Menjalankan Aplikasi

Jalankan server backend dan frontend dalam dua terminal terpisah:

### Terminal 1: Server Backend Laravel
```bash
php artisan serve
```
> Server berjalan di: `http://127.0.0.1:8000`

### Terminal 2: Server Frontend Vite
```bash
npm run dev
```
> Vite dev server berjalan di: `http://localhost:5173`

---

## 🔑 Akun Uji Coba (Demo Credentials)

Gunakan akun berikut yang telah dibuat secara otomatis oleh `DatabaseSeeder`:

### 👑 1. Akun HRD / Administrator
- **URL Login**: `http://127.0.0.1:8000/hrd-login`
- **Akun Utama (Gmail)**:
  - **Email**: `adminhrd@gmail.com`
  - **Password**: `hrd12345`
- **Akun Cadangan (BlitzHire)**:
  - **Email**: `hrd@blitzhire.com`
  - **Password**: `password`
- **Hak Akses**: Kelola lowongan pekerjaan, verifikasi berkas kandidat, jadwalkan wawancara, buat penawaran kerja (*offering*), dan lihat laporan.

### 👤 2. Akun Pelamar / Kandidat
- **URL Login**: `http://127.0.0.1:8000/kandidat/login`
- **Akun Demo Utama**:
  - **Email**: `pelamar@gmail.com`
  - **Password**: `tes12345`
  - *(Sudah dilengkapi data lamaran aktif tahap Wawancara & Penawaran)*
- **Daftar Akun Contoh Lainnya** (Password: `password`):
  - `adit.pratama@gmail.com` (Status: *Screening*)
  - `candra.wijaya@gmail.com` (Status: *Wawancara*)
  - `eko.setiawan@gmail.com` (Status: *Offer*)
  - `gita.mariana@gmail.com` (Status: *Diterima*)
  - `hendra.putra@gmail.com` (Status: *Ditolak*)
- **Registrasi Baru**: Anda juga dapat membuat akun pelamar baru di `http://127.0.0.1:8000/kandidat/register`.

---

## 🧭 Rute & Navigasi Utama

| Rute / Path | Method | Guard / Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `/` | GET | Publik | Landing page utama & showcase statistik |
| `/jobs` | GET | Publik | Daftar seluruh lowongan kerja terbuka |
| `/jobs/{id}` | GET | Publik | Detail lowongan & formulir lamar |
| `/hrd-login` | GET/POST | Guest HRD | Halaman login portal HRD |
| `/kandidat/login` | GET/POST | Guest Pelamar | Halaman login pelamar |
| `/kandidat/register` | GET/POST | Guest Pelamar | Pendaftaran akun pelamar |
| `/hrd/dashboard` | GET | `auth:hrd` | Dashboard analitik & ringkasan HRD |
| `/hrd/kelola-job` | GET | `auth:hrd` | Manajemen daftar lowongan pekerjaan |
| `/hrd/manajemen-kandidat` | GET | `auth:hrd` | Pipeline seluruh kandidat masuk |
| `/hrd/lowongan/{id}/kandidat` | GET | `auth:hrd` | Daftar kandidat pada lowongan tertentu |
| `/pelamar/dashboard` | GET | `auth:pelamar` | Dashboard pelamar (status lamaran & jadwal) |

---

## ❓ Troubleshooting

### 1. `npm error ENOENT Could not read package.json`
- **Penyebab**: Perintah `npm run dev` atau `npm install` dijalankan di luar folder `blitzhire` (misal di folder induk `test-3`).
- **Solusi**: Pindah ke folder proyek terlebih dahulu:
  ```bash
  cd blitzhire
  npm run dev
  ```

### 2. Database SQLite `General error: 1 no such table`
- **Penyebab**: Migrasi belum dijalankan atau file database baru saja dibuat.
- **Solusi**:
  ```bash
  php artisan migrate:fresh --seed
  ```

### 3. Tampilan Halaman Kosong atau Styling Tidak Muncul
- **Penyebab**: Vite server belum berjalan atau belum dibuild.
- **Solusi**: Pastikan `npm run dev` sedang aktif di terminal, atau lakukan build aset:
  ```bash
  npm run build
  ```

### 4. File Upload (CV/Resume) Tidak Bisa Diunduh atau Dibuka
- **Solusi**: Buat tautan penyimpanan publik Laravel:
  ```bash
  php artisan storage:link
  ```

---

## 📄 Lisensi

Proyek ini dikembangkan di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).
# blitzhire_v1
# blitzhire_v1
