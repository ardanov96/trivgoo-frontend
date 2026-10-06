# ✈️ Trivgoo Frontend — Modern AI-Powered OTA Travel Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📌 Overview

**Trivgoo Frontend** adalah antarmuka web interaktif berperforma tinggi untuk platform **Online Travel Agent (OTA)** generasi modern. Dikembangkan dengan **React 18**, **TypeScript**, dan **Vite**, aplikasi ini memberikan pengalaman pengguna yang cepat, elegan, dan kaya interaksi, lengkap dengan fitur **AI Trip Planner**, katalog perjalanan multi-vertikal, dasbor multi-peran, serta integrasi peta dan tiket digital.

Aplikasi ini terhubung langsung ke backend [trivgoo-backend](https://github.com/ardanov96/trivgoo-backend) melalui sistem reverse-proxy tanpa kendala *cross-origin cookie*.

---

## ✨ Fitur Utama Frontend

### 🤖 1. AI Trip Planner & Smart Itinerary Generator
* **Narrative Travel Prompting**: Antarmuka perencanaan liburan intuitif berbasis input cerita dan preferensi pengguna.
* **Timeline Itinerary View**: Visualisasi rencana perjalanan per hari lengkap dengan perkiraan durasi, biaya, dan tips lokal.
* **Smart Bundle Checkout**: Opsi instan untuk memesan paket bundling (*tour + penginapan + armada mobil*) dalam satu klik.

### 🗺️ 2. Katalog Perjalanan & Peta Interaktif
* **Multi-Vertical Catalog**: Filter dan pencarian dinamis untuk Paket Wisata (*Tour*), Hotel/Vila (*Stay*), Armada Mobil (*Car Rental*), dan Penjemputan Bandara.
* **Interactive Maps (Leaflet)**: Peta interaktif dengan pin lokasi objek wisata dan titik penjemputan.
* **Flash Sale & Badges**: Tampilan banner promosi kilat dengan penghitung waktu mundur (*countdown timer*).

### 🎫 3. Tiket Digital & Export PDF
* **E-Ticket & Voucher PDF**: Pembuatan tiket elektronik instan yang dapat diunduh dalam format PDF atau gambar menggunakan `jspdf` dan `html2canvas`.
* **QR Code Validation**: Generate kode QR dinamis untuk verifikasi tiket pemesanan di lokasi wisata.

### 📊 4. Dasbor Multi-Peran (RBAC)
* **Customer Portal**: Riwayat pemesanan (*My Bookings*), pelacakan poin loyalitas, kode referral, dan status pengajuan perubahan tanggal (*reschedule*).
* **Agent / Vendor Portal**: Onboarding dan upload dokumen KYC (KTP & NIB), manajemen produk dan inventaris armada, pengajuan flash sale, serta manajemen pendapatan (*payouts*).
* **Admin Dashboard**: Panel metrik performa transaksi menggunakan grafik interaktif (`recharts`), verifikasi mitra agen, dan manajemen komisi platform.

### 🌐 5. Desain Modern & Multilingual
* **Internationalization (i18n)**: Dukungan multi-bahasa (Bahasa Indonesia & English) dengan auto-detection.
* **Micro-Animations**: Transisi halus dan micro-interactions memanfaatkan `framer-motion` dan ikon modern dari `lucide-react`.

---

## 🛠️ Tech Stack Frontend

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework & Core** | React 18, Vite 6, TypeScript | Fondasi frontend modern dengan build cepat |
| **Styling** | Tailwind CSS v4, PostCSS | Utility-first styling modern dan responsif |
| **Animation** | Framer Motion | Animasi halaman dan komponen UI interaktif |
| **Icons** | Lucide React | Ikon modern beresolusi tinggi |
| **Maps** | Leaflet, React-Leaflet | Visualisasi peta dan koordinat lokasi geografis |
| **Charts** | Recharts | Visualisasi analitik data performa di dasbor |
| **State & HTTP** | Axios, Context API | Client HTTP dengan dukungan HTTP-only session cookies |
| **Localization** | i18next, react-i18next | Sistem penerjemahan multi-bahasa dinamis |
| **Document Export** | jsPDF, html2canvas, qrcode.react | Pembuatan tiket elektronik dan kode QR |

---

## 📁 Struktur Direktori

```
├── components/          # Komponen UI modular (Navbar, Footer, Modals, Cards)
├── pages/               # Halaman utama (Home, Explore, AI Planner, Checkout, Dashboards)
├── services/            # Layanan API (http.ts, authService.ts, bookingService.ts, dll.)
├── hooks/               # Custom React hooks
├── types/               # Type definitions & Interfaces TypeScript
├── utils/               # Helper utilities & formatter
├── public/              # Aset statis (gambar, ikon, logo)
├── AuthContext.tsx      # Manajemen autentikasi global & state pengguna
├── App.tsx              # Router navigasi utama (React Router v6)
├── vercel.json          # Konfigurasi reverse proxy & SPA routing untuk Vercel
└── vite.config.ts       # Konfigurasi Vite bundler & path aliases (@/)
```

---

## 🚀 Panduan Menjalankan di Lokal

### 1. Prasyarat
* Node.js v18 atau lebih baru
* Backend [trivgoo-backend](https://github.com/ardanov96/trivgoo-backend) berjalan di port `4001`

### 2. Clone Repository
```bash
git clone https://github.com/ardanov96/trivgoo-frontend.git
cd trivgoo-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Buat file `.env` di root direktori frontend:
```env
# URL Backend (Opsional: jika kosong, Vite proxy mengarahkan /api ke localhost:4001)
VITE_API_BASE_URL=

# Google Maps API Key (Opsional untuk fitur peta Google)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---

## ☁️ Panduan Deployment ke Vercel (100% Gratis)

Aplikasi ini sudah dilengkapi dengan file `vercel.json` yang mengonfigurasi **Reverse Proxy**:

```json
{
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "https://<NAMA-BACKEND-ANDA>.onrender.com/api/:match*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Keunggulan Setup Ini:
1. **Bypass Cross-Origin Cookies**: Request `/api/*` diteruskan secara *same-origin* oleh Vercel, sehingga sesi login dan cookie aman di Safari/Chrome tanpa kena blokir *third-party cookie*.
2. **Tanpa CORS Error**: Menghilangkan masalah CORS origin di lingkungan produksi.
3. **Gratis Selamanya**: Vercel menyediakan kuota bandwidth dan build gratis dengan global CDN.

---

## 📄 Lisensi

Distributed under the MIT License. Dikembangkan oleh [ardanov96](https://github.com/ardanov96).
