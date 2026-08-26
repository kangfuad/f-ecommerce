# 🧠 Master Project Memory: e-punyasewa Monorepo / Multi-Package Workspace

**Root Workspace Directory:** `/Users/auri/fuad/LATIHAN/punyasewa`  
**Platform:** e-punyasewa — Platform Informasi & Reservasi Sewa Perlengkapan Modern (Rental Marketplace & Timeline Management)

---

## 📂 Struktur Repositori & Direktori

```
/Users/auri/fuad/LATIHAN/punyasewa/
├── ecommerce/       # [FE FO] Frontend Front Office (Vue 3 + TypeScript + Vite + Tailwind CSS)
└── api-service/     # [BE API] Backend RESTful API Service (NestJS + Prisma ORM + PostgreSQL + Redis)
```

---

## 🎯 Panduan Kendali Penuh Multi-Repo (Dual-Repo Execution Guidelines)

1. **Kendali Penuh Kedua Direktori:**
   - Agen memiliki kendali penuh untuk membaca, menulis, memodifikasi, dan mengeksekusi perintah di kedua direktori:
     - Frontend: `/Users/auri/fuad/LATIHAN/punyasewa/ecommerce`
     - Backend: `/Users/auri/fuad/LATIHAN/punyasewa/api-service`
2. **Sinkronisasi Langsung (Direct Cross-Execution):**
   - Jika terdapat penyesuaian pada Frontend (FE) yang membutuhkan endpoint, DTO, atau skema baru di Backend (BE), langsung lakukan perubahan dan eksekusi di kedua repositori tanpa menunggu instruksi terpisah.
   - Contoh: Menambah modul/fitur baru -> Update Prisma schema & Controller/Service di `api-service` -> Jalankan `prisma generate` / `prisma db push` -> Update API client & UI Composable di `ecommerce`.

---

## 🛠️ Tech Stack & Konfigurasi Masing-Masing Repositori

### 1. Frontend Front Office (`ecommerce`)
- **Path:** `/Users/auri/fuad/LATIHAN/punyasewa/ecommerce`
- **Stack:** Vue 3 (Composition API), TypeScript (Strict), Vite, Tailwind CSS, Pinia/Composable state.
- **Environment (.env):** `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- **HTTP Client:** `src/infrastructure/services/api/ApiClient.ts` (Mendukung JWT Injection, Timeout 5s, dan Smart Fallback).
- **Endpoint Registry:** `src/infrastructure/services/api/ApiEndpoints.ts`.
- **Perintah Build:** `npm run build`
- **Perintah Dev:** `npm run dev`

### 2. Backend Service API (`api-service`)
- **Path:** `/Users/auri/fuad/LATIHAN/punyasewa/api-service`
- **Stack:** NestJS v10+, Prisma ORM, PostgreSQL 16+, Redis 7+ (Cache & BullMQ), OpenAPI Swagger.
- **Environment (.env):** `DATABASE_URL`, `REDIS_HOST`, `JWT_SECRET`, `PORT=3000`, `API_PREFIX=api/v1`.
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Perintah Build:** `npm run build`
- **Perintah Dev:** `npm run start:dev`
- **Perintah Prisma:** `npm run prisma:generate` & `npx prisma db push`

---

## 📊 Daftar 8 Modul RESTful API & Database

1. **Modul 1 (Auth & User):** `/api/v1/auth/*` & `/api/v1/user/*` (JWT Authentication, User Profiles, Cascading Domisili).
2. **Modul 2 (Katalog Produk):** `/api/v1/products/*` & `/api/v1/categories` (Multi-filter, Search, Detail unit).
3. **Modul 3 (Reservasi Penyewa):** `/api/v1/bookings` & `/api/v1/orders/*` (Submit booking, My Orders, Extend Rental +N hari, Review Toko).
4. **Modul 4 (Panel Mitra Penyedia):** `/api/v1/provider/orders/*` (Timeline pesanan masuk, Confirm, Reject, Upload Berkas TTD & Bill, Complete Rental, Review Tenant).
5. **Modul 5 (Wilayah Indonesia & FAQ):** `/api/v1/regions/*` (34 Provinsi, 514 Kota/Kab, 7.2k Kecamatan, 83k Kelurahan/Desa) & `/api/v1/faqs`.
6. **Modul 6 (Media & File Storage):** `/api/v1/storage/upload` (Upload berkas PDF Surat Perjanjian Sewa / Kwitansi ke `/uploads`).
7. **Modul 7 (Keranjang Sewa - DB Cart):** `/api/v1/cart/*` (Tabel `cart_items` di PostgreSQL, Get Cart, Add Item, Update Duration/Qty, Remove Item, Clear Cart).
8. **Modul 8 (Produk Favorit - DB Wishlist):** `/api/v1/favorites/*` (Tabel `user_favorites` di PostgreSQL, Get Favorites, Toggle Favorite, Remove Favorite).

---

## ⚠️ Aturan Kritis Pengembangan (Core Engineering Rules)
1. **No Raw Emojis:** Dilarang menggunakan emoji teks Unicode pada UI. Gunakan komponen SVG Icon resmi di `src/presentation/components/icons/`.
2. **Offline Resilience / Smart Fallback:** Seluruh service frontend wajib memiliki fallback cerdas ke data lokal saat backend offline / testing mode.
3. **No Automatic Push:** Jangan jalankan `git push origin main` secara otomatis, cukup lakukan local git commit (`git commit`).
