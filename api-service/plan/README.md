# 🚀 Spesifikasi & Rencana Pembangunan API Service (FE Front Office)
**Platform:** e-punyasewa — Platform Informasi & Reservasi Sewa Perlengkapan Modern  
**Versi API:** `v1` (`/api/v1/...`)  
**Format Amplop Respons:** Standard RESTful JSON Envelope

```json
{
  "status": "success" | "error",
  "message": "Pesan deskriptif dari server",
  "data": { ... } | [ ... ],
  "meta": {
    "timestamp": "ISO-8601",
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "limit": 10
    }
  }
}
```

---

## 📑 DAFTAR ISI MODUL
1. [Modul 1: Autentikasi & Profil Pengguna (Auth & User Profile)](#1-modul-autentikasi--profil-pengguna)
2. [Modul 2: Katalog & Penemuan Unit Sewa (Catalog & Products)](#2-modul-katalog--penemuan-unit-sewa)
3. [Modul 3: Reservasi & Manajemen Pesanan Penyewa (Tenant Bookings & Orders)](#3-modul-reservasi--pesanan-penyewa)
4. [Modul 4: Panel Mitra Penyedia Sewa (Provider Store & Timeline)](#4-modul-panel-mitra-penyedia-sewa)
5. [Modul 5: Wilayah Administratif & Data Master (Regions & Master Data)](#5-modul-wilayah--data-master)

---

## 1. MODUL AUTENTIKASI & PROFIL PENGGUNA

### 1.1 Login Kredensial (Email / Nomor WhatsApp)
* **Endpoint:** `POST /api/v1/auth/login`
* **Deskripsi dari API ini:** Memverifikasi kredensial pengguna (email/nomor WhatsApp dan kata sandi), mengembalikan token akses JWT, status kepemilikan lapak mitra (`hasProviderStore`), dan ringkasan profil.
* **Payload (Request Body):**
```json
{
  "identifier": "auri.fuad@example.com",
  "password": "PasswordRahasia123!"
}
```
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_01jk98az89",
      "fullName": "Auri Fuad",
      "displayName": "Auri Fuad",
      "email": "auri.fuad@example.com",
      "phone": "081234567890",
      "initials": "AF",
      "isKycVerified": true,
      "kycStatus": "VERIFIED",
      "hasProviderStore": true,
      "providerStoreName": "CinemaTech Rental Jakarta",
      "profession": "Videografer & Drone Pilot",
      "companyOrStudio": "Auri Studio",
      "socialMediaInstagram": "@aurifuad",
      "city": "Kota Jakarta Selatan, DKI Jakarta",
      "address": "Jl. Senopati No. 45, Kebayoran Baru",
      "postalCode": "12190",
      "emergencyContactName": "Rina Fuad",
      "emergencyPhone": "081298765432",
      "emergencyRelation": "Pasangan",
      "bio": "Spesialis produksi video komersial dan dokumenter.",
      "joinedAt": "2026-01-15T08:30:00.000Z"
    }
  }
}
```
* **Logika yang Dilakukan:**
  1. Validasi kelengkapan format email / nomor WhatsApp dan kata sandi.
  2. Verifikasi hash password (Argon2id / Bcrypt) pada basis data `users`.
  3. Cek relasi ke tabel `provider_stores` untuk mengisi flag `hasProviderStore` (menentukan visibilitas menu *Panel Penyedia Sewa* di FE).
  4. Generate JWT Access Token (expired 24 jam) dan Refresh Token.
  5. Catat log waktu masuk (*last_login_at*).

---

### 1.2 Registrasi Akun Pengguna Baru
* **Endpoint:** `POST /api/v1/auth/register`
* **Deskripsi dari API ini:** Mendaftarkan akun penyewa baru dengan data identitas dasar (Nama Sesuai KTP, WhatsApp, Email, dan Password).
* **Payload (Request Body):**
```json
{
  "fullName": "Budi Santoso",
  "email": "budi.santoso@example.com",
  "phone": "081399887766",
  "password": "PasswordKuat123!"
}
```
* **Respon (Success - 201 Created):**
```json
{
  "status": "success",
  "message": "Pendaftaran akun berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_02jk99bb12",
      "fullName": "Budi Santoso",
      "email": "budi.santoso@example.com",
      "phone": "081399887766",
      "initials": "BS",
      "isKycVerified": true,
      "hasProviderStore": false,
      "joinedAt": "2026-08-26T12:00:00.000Z"
    }
  }
}
```
* **Logika yang Dilakukan:**
  1. Validasi keunikan email & nomor WhatsApp.
  2. Hash password pengguna.
  3. Buat inisial nama otomatis (contoh: "BS").
  4. Simpan record akun ke tabel `users`. Default `hasProviderStore: false`.
  5. Terbitkan token JWT instan untuk auto-login.

---

### 1.3 Update Profil & Domisili Pengguna
* **Endpoint:** `PUT /api/v1/user/profile`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Memperbarui data identitas pemesan, profesi, domisili berjenjang (BPS/Kemendagri), kontak darurat, dan bio.
* **Payload (Request Body):**
```json
{
  "fullName": "Auri Fuad",
  "phone": "081234567890",
  "profession": "Sinematografer & Produser",
  "companyOrStudio": "Cinema Works Asia",
  "socialMediaInstagram": "@aurifilm",
  "provinceId": "31",
  "provinceName": "DKI JAKARTA",
  "regencyId": "3171",
  "regencyName": "KOTA JAKARTA SELATAN",
  "districtId": "3171060",
  "districtName": "KEBAYORAN BARU",
  "villageId": "3171060008",
  "villageName": "SELONG",
  "city": "Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta",
  "address": "Jl. Gandaria 1 No. 12",
  "postalCode": "12190",
  "emergencyContactName": "Rina Fuad",
  "emergencyPhone": "081298765432",
  "emergencyRelation": "Pasangan",
  "bio": "Fokus pada rental perlengkapan kamera bioskop dan drone berlisensi."
}
```
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Profil pengguna berhasil diperbarui.",
  "data": {
    "id": "usr_01jk98az89",
    "fullName": "Auri Fuad",
    "phone": "081234567890",
    "city": "Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta",
    "updatedAt": "2026-08-26T12:05:00.000Z"
  }
}
```
* **Logika yang Dilakukan:**
  1. Ekstrak `userId` dari token JWT.
  2. Sanitasi input form.
  3. Perbarui baris pada tabel `users` dan `user_profiles`.

---

## 2. MODUL KATALOG & PENEMUAN UNIT SEWA

### 2.1 Mengambil Daftar Katalog Unit Sewa
* **Endpoint:** `GET /api/v1/products`
* **Query Parameters:**
  * `category` (opsional): `CAMERA` | `DRONE_AUDIO` | `OUTDOOR` | `LAPTOP_GADGET` | `STAGE_EVENT`
  * `search` (opsional): Kata kunci teks pencarian
  * `minPrice` & `maxPrice` (opsional): Filter tarif harian
  * `condition` (opsional): `NEW` | `LIKE_NEW` | `EXCELLENT`
  * `location` (opsional): Nama wilayah/kota
  * `sortBy` (opsional): `popular` | `price_asc` | `price_desc` | `rating` | `newest`
  * `page` (default: 1) & `limit` (default: 12)
* **Deskripsi dari API ini:** Mengambil inventaris unit perlengkapan sewa yang aktif dengan filter multi-dimensi, pencarian, dan paginasi.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Daftar katalog berhasil diambil.",
  "data": [
    {
      "id": "eps_drone_01",
      "name": "DJI Mavic 3 Pro Cine Combo Drone",
      "slug": "dji-mavic-3-pro-cine-combo-drone",
      "category": "DRONE_AUDIO",
      "description": "Drone flagship dengan triple-camera Hasselblad Apple ProRes 422 HQ, transmisi O3+ hingga 15km, dan waktu terbang 43 menit.",
      "dailyRate": 550000,
      "depositAmount": 2500000,
      "rating": 4.9,
      "reviewCount": 38,
      "condition": "LIKE_NEW",
      "badgeText": "POPULAR",
      "location": "Jakarta Selatan",
      "stockAvailable": 3,
      "primaryImage": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800",
      "images": [
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800",
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800"
      ],
      "includedItems": [
        "1x Drone DJI Mavic 3 Pro Cine",
        "1x Remote DJI RC Pro",
        "3x Baterai Intelligent Flight",
        "1x ND Filter Set (ND8/16/32/64)",
        "1x Hardcase Safety Pelindung"
      ],
      "provider": {
        "id": "prv_01",
        "name": "CinemaTech Rental Jakarta",
        "phone": "0811-9876-5432",
        "rating": 5.0,
        "isVerified": true
      }
    }
  ],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 24,
      "limit": 12
    }
  }
}
```
* **Logika yang Dilakukan:**
  1. Filter query database hanya unit dengan status `is_published = true` dan `is_active = true`.
  2. Join tabel `provider_stores` untuk menyertakan nama toko penyedia dan skor reputasi.
  3. Kembalikan data sesuai DTO katalog.

---

### 2.2 Mengambil Detail Lengkap Unit Sewa
* **Endpoint:** `GET /api/v1/products/:id` (atau `GET /api/v1/products/slug/:slug`)
* **Deskripsi dari API ini:** Menampilkan spesifikasi mendalam, daftar kelengkapan paket unit, rincian tarif per hari, dan data penyedia sewa.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Detail produk berhasil diambil.",
  "data": {
    "id": "eps_cam_01",
    "name": "Sony FX3 Full-Frame Cinema Line Camera",
    "category": "CAMERA",
    "description": "Kamera sinema full-frame ringkas dengan sensor 10.2MP BSI CMOS, 4K 120p 10-bit 4:2:2, 15+ stops dynamic range, S-Cinetone, dan pegangan audio XLR.",
    "dailyRate": 650000,
    "depositAmount": 3000000,
    "condition": "LIKE_NEW",
    "rating": 5.0,
    "reviewCount": 42,
    "location": "Jakarta Selatan (Hub Gandaria)",
    "includedItems": [
      "1x Bodi Sony FX3 Cinema Line",
      "1x XLR Audio Handle Unit",
      "3x Baterai Sony NP-FZ100",
      "1x Dual Fast Charger",
      "2x CFexpress Type A 160GB",
      "1x Hardcase Waterproof Pelindung"
    ],
    "provider": {
      "id": "prv_01",
      "name": "CinemaTech Rental Jakarta",
      "address": "Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan",
      "phone": "0811-9876-5432",
      "rating": 5.0
    }
  }
}
```

---

## 3. MODUL RESERVASI & PESANAN PENYEWA

### 3.1 Mengajukan Booking Sewa (*Submit Booking*)
* **Endpoint:** `POST /api/v1/bookings`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Membuat draf reservasi sewa baru. Menentukan unit, durasi sewa, titik temu serah terima, dan kontak pemesan. Status awal adalah `PENDING_CONFIRMATION`.
* **Payload (Request Body):**
```json
{
  "items": [
    {
      "productId": "eps_drone_01",
      "quantity": 1,
      "startDate": "2026-08-27",
      "endDate": "2026-08-30",
      "rentalDays": 3,
      "dailyRate": 550000,
      "totalAmount": 1650000
    }
  ],
  "meetup": {
    "locationType": "PROVIDER_HUB",
    "locationName": "Hub Gandaria Jakarta Selatan",
    "locationAddress": "Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan",
    "scheduleDate": "2026-08-27",
    "scheduleTime": "09:00 WIB"
  },
  "customer": {
    "fullName": "Auri Fuad",
    "phone": "081234567890",
    "email": "auri.fuad@example.com",
    "deliveryAddress": "Jl. Gandaria 1 No. 12, Kebayoran Baru"
  },
  "bookingNotes": "Digunakan untuk syuting aerial proyek komersial."
}
```
* **Respon (Success - 201 Created):**
```json
{
  "status": "success",
  "message": "Pengajuan booking berhasil dikirim ke penyedia sewa.",
  "data": {
    "orderId": "EPS-2026-8901",
    "lifecycleStatus": "PENDING_CONFIRMATION",
    "grandTotal": 1650000,
    "createdAt": "2026-08-26T12:10:00.000Z",
    "nextStep": "Menunggu konfirmasi jadwal & ketersediaan dari mitra penyedia sewa."
  }
}
```
* **Logika yang Dilakukan:**
  1. Validasi tanggal sewa (`endDate` > `startDate`).
  2. Validasi stok unit pada rentang tanggal yang diminta.
  3. Hitung total murni: $\text{dailyRate} \times \text{rentalDays} \times \text{quantity}$.
  4. Simpan pesanan ke tabel `rental_orders` dengan status `PENDING_CONFIRMATION`.
  5. Kirim event/notifikasi ke penyedia terkait.

---

### 3.2 Mengambil Riwayat Pesanan Penyewa (*My Orders*)
* **Endpoint:** `GET /api/v1/orders/my-orders`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `status` (opsional: `PENDING` | `ACTIVE` | `COMPLETED` | `ALL`)
* **Deskripsi dari API ini:** Menampilkan daftar seluruh transaksi booking yang diajukan oleh penyewa yang sedang login beserta status konfirmasi dan dokumen bukti sewa bertandatangan jika sudah diupload penyedia.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Riwayat pesanan berhasil diambil.",
  "data": [
    {
      "id": "EPS-2026-8901",
      "lifecycleStatus": "ACTIVE_RENTAL",
      "createdAt": "2026-08-26T10:00:00.000Z",
      "items": [
        {
          "productId": "eps_drone_01",
          "productName": "DJI Mavic 3 Pro Cine Combo Drone",
          "primaryImage": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800",
          "quantity": 1,
          "rentalDays": 3,
          "startDate": "2026-08-27",
          "endDate": "2026-08-30",
          "dailyRate": 550000,
          "totalAmount": 1650000
        }
      ],
      "meetup": {
        "locationType": "PROVIDER_HUB",
        "locationName": "Hub Gandaria Jakarta Selatan",
        "locationAddress": "Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan",
        "scheduleDate": "2026-08-27",
        "scheduleTime": "09:00 WIB"
      },
      "pricing": {
        "subtotalRental": 1650000,
        "grandTotal": 1650000
      },
      "provider": {
        "id": "prv_01",
        "name": "CinemaTech Rental Jakarta",
        "phone": "0811-9876-5432"
      },
      "signedAgreementUrl": "https://storage.e-punyasewa.id/agreements/sp_eps_8901.pdf",
      "paymentBillUrl": "https://storage.e-punyasewa.id/bills/bill_eps_8901.jpg",
      "userReview": null,
      "providerReview": {
        "overallRating": 5,
        "comment": "Penyewa sangat komunikatif dan tepat waktu saat serah terima.",
        "createdAt": "2026-08-26T12:00:00.000Z"
      }
    }
  ]
}
```

---

### 3.3 Mengajukan Perpanjangan Sewa (*Extend Rental*)
* **Endpoint:** `POST /api/v1/orders/:id/extend`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Mengajukan perpanjangan durasi sewa saat unit sedang aktif digunakan.
* **Payload (Request Body):**
```json
{
  "additionalDays": 2,
  "notes": "Jadwal produksi mundur 2 hari."
}
```
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Pengajuan perpanjangan berhasil dikirim.",
  "data": {
    "orderId": "EPS-2026-8901",
    "additionalDays": 2,
    "additionalFee": 1100000,
    "newEndDate": "2026-09-01"
  }
}
```

---

### 3.4 Penyewa Mengirim Review untuk Penyedia Sewa
* **Endpoint:** `POST /api/v1/orders/:id/review`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Penyewa memberikan rating bintang (1-5) dan review pelayanan mitra sewa setelah masa sewa selesai.
* **Payload (Request Body):**
```json
{
  "rating": 5,
  "comment": "Unit drone sangat prima, baterai full, dan pelayanan ramah!",
  "tags": ["Unit Bersih", "Pelayanan Cepat", "Sangat Direkomendasikan"]
}
```

---

## 4. MODUL PANEL MITRA PENYEDIA SEWA

> 🔒 **Hak Akses:** Hanya dapat diakses oleh user dengan flag `hasProviderStore: true`.

### 4.1 Mengambil Timeline Pesanan Toko (*Provider Orders Timeline*)
* **Endpoint:** `GET /api/v1/provider/orders`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Mengambil seluruh daftar pesanan yang masuk ke lapak mitra penyedia, dikelompokkan dalam tab: `PENDING_CONFIRMATION`, `ACTIVE_RENTAL`, dan `COMPLETED`.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Data timeline penyedia berhasil diambil.",
  "data": {
    "pendingCount": 1,
    "activeCount": 2,
    "completedCount": 14,
    "orders": [
      {
        "id": "EPS-2026-8901",
        "lifecycleStatus": "PENDING_CONFIRMATION",
        "createdAt": "2026-08-26T11:00:00.000Z",
        "customer": {
          "id": "usr_99",
          "fullName": "Dian Pratama",
          "phone": "081234567890",
          "email": "dian.pratama@example.com",
          "isKycVerified": true
        },
        "items": [
          {
            "productName": "Sony FX3 Full-Frame Cinema Line Camera",
            "quantity": 1,
            "startDate": "2026-08-27",
            "endDate": "2026-08-29",
            "rentalDays": 2,
            "dailyRate": 650000,
            "totalAmount": 1300000
          }
        ],
        "meetup": {
          "locationName": "Hub Gandaria Jakarta Selatan",
          "locationAddress": "Jl. Gandaria 1 No. 12, Kebayoran Baru",
          "scheduleDate": "2026-08-27",
          "scheduleTime": "09:00 WIB"
        },
        "pricing": {
          "grandTotal": 1300000
        },
        "signedAgreementUrl": null,
        "paymentBillUrl": null
      }
    ]
  }
}
```

---

### 4.2 Menerima & Konfirmasi Pesanan (*Accept Booking*)
* **Endpoint:** `PUT /api/v1/provider/orders/:id/confirm`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Penyedia sewa menyetujui booking dan mengonfirmasi jadwal temu. Status pesanan berubah menjadi `CONFIRMED`.
* **Payload:** `{}`
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Pesanan diterima dan jadwal temu dikonfirmasi.",
  "data": {
    "orderId": "EPS-2026-8901",
    "lifecycleStatus": "CONFIRMED",
    "documentNo": "SP-EPS-EPS-2026-8901"
  }
}
```

---

### 4.3 Menolak Pesanan Booking (*Reject Booking*)
* **Endpoint:** `PUT /api/v1/provider/orders/:id/reject`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Penyedia sewa menolak booking karena unit sedang diservis atau bentrok jadwal.
* **Payload (Request Body):**
```json
{
  "reason": "Unit sedang dalam jadwal perawatan sensor berkala di service center resmi."
}
```
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Pesanan berhasil ditolak.",
  "data": {
    "orderId": "EPS-2026-8901",
    "lifecycleStatus": "REJECTED"
  }
}
```

---

### 4.4 Mengunggah Berkas TTD & Bukti Pembayaran (*Upload Agreement & Bill*)
* **Endpoint:** `POST /api/v1/provider/orders/:id/upload-documents`
* **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: multipart/form-data`
* **Deskripsi dari API ini:** Mengunggah file PDF / Foto Surat Perjanjian Sewa (SP-EPS) bertandatangan dan bukti kuitansi pembayaran (bill) setelah serah terima unit di lokasi selesai.
* **Payload (`multipart/form-data`):**
  * `signedAgreementFile` (File: `.pdf`, `.jpg`, `.png`, max 10MB)
  * `paymentBillFile` (File: `.pdf`, `.jpg`, `.png`, max 10MB)
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Dokumen perjanjian dan bukti pembayaran berhasil diunggah.",
  "data": {
    "orderId": "EPS-2026-8901",
    "signedAgreementUrl": "https://storage.e-punyasewa.id/agreements/sp_eps_8901_signed.pdf",
    "paymentBillUrl": "https://storage.e-punyasewa.id/bills/bill_eps_8901.jpg",
    "canComplete": true
  }
}
```
* **Logika yang Dilakukan:**
  1. Validasi file dan simpan ke cloud storage.
  2. Perbarui URL berkas pada data pesanan.
  3. Aktifkan visibilitas tombol **"Selesaikan Sewa"** pada Panel Penyedia.

---

### 4.5 Menyelesaikan Masa Sewa Unit (*Complete Rental*)
* **Endpoint:** `PUT /api/v1/provider/orders/:id/complete`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Menutup transaksi sewa secara resmi setelah masa sewa berakhir dan unit dikembalikan dalam kondisi normal.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Masa sewa selesai dan transaksi berhasil ditutup.",
  "data": {
    "orderId": "EPS-2026-8901",
    "lifecycleStatus": "COMPLETED",
    "completedAt": "2026-08-26T12:30:00.000Z"
  }
}
```

---

### 4.6 Penyedia Memberikan Review Reputasi Penyewa
* **Endpoint:** `POST /api/v1/provider/orders/:id/review-tenant`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Deskripsi dari API ini:** Penyedia sewa memberikan penilaian integritas penyewa (ketepatan waktu pengembalian, kebersihan unit, dan komunikasi).
* **Payload (Request Body):**
```json
{
  "rating": 5,
  "comment": "Penyewa sangat amanah, tepat waktu saat jadwal temu, dan unit kembali dalam kondisi bersih prima.",
  "badges": ["Pengembalian Tepat Waktu", "Unit Terawat Sangat Baik"]
}
```

---

## 5. MODUL WILAYAH & DATA MASTER

### 5.1 Cascading Wilayah Administratif Indonesia (BPS / Kemendagri)
* **Endpoint:** `GET /api/v1/regions`
* **Query Parameters:**
  * `type`: `provinces` | `regencies` | `districts` | `villages`
  * `parentId` (wajib jika type bukan `provinces`)
* **Deskripsi dari API ini:** Menyediakan data berjenjang wilayah Indonesia untuk fitur pemilihan domisili profil dan alamat temu.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "data": [
    { "id": "3171", "name": "KOTA JAKARTA SELATAN" },
    { "id": "3172", "name": "KOTA JAKARTA TIMUR" },
    { "id": "3173", "name": "KOTA JAKARTA PUSAT" }
  ]
}
```

---

### 5.2 Pusat Bantuan & FAQ Prosedur
* **Endpoint:** `GET /api/v1/faqs`
* **Deskripsi dari API ini:** Mengambil daftar tanya-jawab resmi alur booking, serah terima, ketentuan QC, dan tanggung jawab unit.
* **Respon (Success - 200 OK):**
```json
{
  "status": "success",
  "message": "Data FAQ berhasil diambil.",
  "data": [
    {
      "id": "faq-01",
      "category": "PROSEDUR",
      "categoryLabel": "Alur & Prosedur Rental",
      "question": "Bagaimana alur dan prosedur booking sewa di e-punyasewa?",
      "answer": "Proses penyewaan unit dirancang serba cepat dan praktis melalui tahapan...",
      "steps": [
        "Pilih unit perlengkapan di katalog.",
        "Tentukan jadwal mulai dan selesai sewa.",
        "Pilih lokasi serah terima transaksi.",
        "Ajukan booking ke penyedia sewa.",
        "Serah terima unit di lokasi, uji QC bersama, tanda tangan form sewa, dan selesaikan pembayaran langsung."
      ]
    }
  ]
}
```
