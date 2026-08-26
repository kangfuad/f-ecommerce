# 🚀 e-punyasewa API Service

Backend API Service lengkap untuk platform **e-punyasewa** (Platform Informasi & Reservasi Sewa Perlengkapan Modern).

---

## 🛠️ Tech Stack

- **Runtime & Language:** Node.js v20+ LTS & TypeScript (Strict Mode)
- **Framework:** NestJS v10+ (Modular Architecture, Dependency Injection)
- **Database Relasional:** PostgreSQL 16+ dengan Prisma ORM
- **Cache & Queue:** Redis 7+ (`@nestjs/cache-manager`, `cache-manager-redis-yet`, `@nestjs/bullmq`)
- **Autentikasi & Keamanan:** JWT (`@nestjs/jwt`, `passport-jwt`), `argon2` password hash, `helmet`, `@nestjs/throttler` (Rate Limiting)
- **Validasi & Transformasi:** `class-validator` & `class-transformer`
- **Dokumentasi API:** OpenAPI / Swagger (`@nestjs/swagger`) di `/api/docs`
- **File Storage:** Multer & Storage Driver (Local disk / S3-compatible)

---

## 📐 Format Amplop Standar API (Standard Response Envelope)

Semua endpoint mengembalikan respons dengan format JSON standar seragam:

### Respons Berhasil (Success)
```json
{
  "status": "success",
  "message": "Pesan deskriptif status",
  "data": { ... } | [ ... ] | null,
  "meta": {
    "timestamp": "2026-08-26T12:00:00.000Z",
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "limit": 10
    }
  }
}
```

### Respons Gagal (Error)
```json
{
  "status": "error",
  "message": "Deskripsi error atau validasi gagal",
  "data": null,
  "meta": {
    "timestamp": "2026-08-26T12:00:00.000Z"
  }
}
```

---

## 🚀 Panduan Menjalankan Layanan

### 1. Prasyarat
- Node.js v20+ & npm
- Docker & Docker Compose (untuk menjalankan PostgreSQL & Redis)

### 2. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 3. Menjalankan Database & Redis (Docker)
```bash
docker compose up -d
```

### 4. Setup Database & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init

# Jalankan seed data awal
npm run prisma:seed
```

### 5. Menjalankan Aplikasi
```bash
# Mode pengembangan (hot-reload)
npm run start:dev

# Mode produksi
npm run build
npm run start:prod
```

### 6. Dokumentasi Interaktif Swagger
Buka browser dan akses:
```
http://localhost:3000/api/docs
```

---

## 🔑 Akun Demo Default (Hasil Seeding)

| Peran / Tipe | Email | Password | Toko Mitra |
| :--- | :--- | :--- | :--- |
| **Mitra Penyedia & Penyewa** | `auri.fuad@example.com` | `PasswordRahasia123!` | CinemaTech Rental Jakarta (`hasProviderStore: true`) |
| **Penyewa Reguler (1)** | `budi.santoso@example.com` | `PasswordKuat123!` | - (`hasProviderStore: false`) |
| **Penyewa Reguler (2)** | `dian.pratama@example.com` | `PasswordKuat123!` | - (`hasProviderStore: false`) |

---

## 📑 Ringkasan Endpoint API

### 1. Autentikasi & Pengguna (`/api/v1/auth`, `/api/v1/user`)
- `POST /api/v1/auth/login` : Login identifier (email/phone) + password $\rightarrow$ JWT + User data + `hasProviderStore`.
- `POST /api/v1/auth/register` : Registrasi akun baru (Nama KTP, Phone, Email, Password).
- `GET /api/v1/user/profile` : Mengambil data diri, domisili, dan kontak darurat *(Bearer Token)*.
- `PUT /api/v1/user/profile` : Memperbarui biodata, kontak darurat, dan wilayah domisili *(Bearer Token)*.

### 2. Katalog Produk (`/api/v1/products`, `/api/v1/categories`)
- `GET /api/v1/categories` : Daftar seluruh kategori aktif.
- `GET /api/v1/products` : Filter multi-dimensi (kategori, search, rentang harga, kondisi, lokasi, sorting) dengan Redis Cache (TTL 10 menit).
- `GET /api/v1/products/:id` : Detail unit, kelengkapan `includedItems`, galeri foto, dan profil mitra penyedia.

### 3. Reservasi & Pesanan Penyewa (`/api/v1/bookings`, `/api/v1/orders`)
- `POST /api/v1/bookings` : Submit booking baru $\rightarrow$ Order ID `EPS-YYYYMMDD-XXXX`, status awal `PENDING_CONFIRMATION` *(Bearer Token)*.
- `GET /api/v1/orders/my-orders` : Riwayat pesanan penyewa dengan filter tab status (`ALL`, `PENDING`, `ACTIVE`, `COMPLETED`, `REJECTED`) *(Bearer Token)*.
- `POST /api/v1/orders/:id/extend` : Perpanjang durasi sewa (+N hari) pada pesanan aktif $\rightarrow$ Recalculate tanggal & total biaya *(Bearer Token)*.
- `POST /api/v1/orders/:id/review` : Penyewa memberi ulasan rating dan testimoni *(Bearer Token)*.

### 4. Panel Mitra Penyedia Sewa (`/api/v1/provider/orders`)
*(Guard: `ProviderStoreGuard` — hanya akun dengan `hasProviderStore: true`)*
- `GET /api/v1/provider/orders` : Mengambil antrean timeline pesanan toko penyedia.
- `PUT /api/v1/provider/orders/:id/confirm` : Terima booking $\rightarrow$ Ubah status ke `CONFIRMED`.
- `PUT /api/v1/provider/orders/:id/reject` : Tolak booking disertai alasan (`rejectionReason`) $\rightarrow$ Ubah status ke `REJECTED`.
- `POST /api/v1/provider/orders/:id/upload-documents` : Upload berkas perjanjian TTD & kuitansi pelunasan (`multipart/form-data`) $\rightarrow$ Ubah status ke `ACTIVE_RENTAL`.
- `PUT /api/v1/provider/orders/:id/complete` : Selesaikan sewa $\rightarrow$ Ubah status ke `COMPLETED`.
- `POST /api/v1/provider/orders/:id/review-tenant` : Penyedia memberi review reputasi penyewa.

### 5. Wilayah Administratif & Data Master (`/api/v1/regions`, `/api/v1/faqs`)
- `GET /api/v1/regions?type=provinces|regencies|districts|villages&parentId=...` : Cascading wilayah Indonesia dengan Redis cache (TTL 24 jam).
- `GET /api/v1/faqs` : Daftar tanya-jawab resmi seputar alur booking dan serah terima unit di tempat.

---

## 🧪 Pengujian Otomatis
```bash
# Menjalankan seluruh Unit Tests
npm test

# Menjalankan pengujian e2e
npm run test:e2e
```
