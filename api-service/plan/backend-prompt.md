# MASTER PROMPT: Pembangunan Backend API Service (e-punyasewa)

> **Instruksi Penggunaan:** Salin seluruh teks di bawah ini dan berikan ke LLM / AI Coding Assistant untuk membangun backend service dari awal secara terstruktur, bersih, dan sesuai spesifikasi.

```markdown
Anda adalah seorang Senior Backend Architect & NestJS Expert. Tugas Anda adalah membangun backend API Service lengkap untuk platform "e-punyasewa" (Platform Informasi & Reservasi Sewa Perlengkapan Modern).

---

## 🛠️ SPESIFIKASI TECH STACK

1. **Runtime & Bahasa:** Node.js (v20+ LTS) & TypeScript (Strict Mode).
2. **Framework Backend:** NestJS v10+ (Modular Architecture, Dependency Injection).
3. **Database Relasional:** PostgreSQL 16+ dengan Prisma ORM.
4. **Cache & Task Queue:** Redis 7+ (`@nestjs/cache-manager`, `ioredis`, `@nestjs/bullmq`).
5. **Autentikasi & Keamanan:** JWT (`@nestjs/jwt`, `passport-jwt`), `argon2` untuk hash password, `helmet`, `@nestjs/throttler` (Rate Limiting).
6. **Validasi & Transformasi:** `class-validator` dan `class-transformer` pada setiap DTO.
7. **Dokumentasi API:** OpenAPI / Swagger (`@nestjs/swagger`) dengan decoratror lengkap.
8. **File Storage:** Multer & S3-Compatible Storage (AWS S3 / Cloudinary / MinIO) untuk upload PDF & Foto.

---

## 📐 STANDAR ARSITEKTUR & RESPON API

### 1. Amplop Standar API (Standard Response Envelope)
Gunakan Global Interceptor (`TransformInterceptor`) dan Global Filter (`HttpExceptionFilter`) agar SEMUA respons memiliki format JSON seragam:
```json
{
  "status": "success" | "error",
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

### 2. Struktur Folder Modul NestJS
```text
src/
├── common/
│   ├── decorators/      # CurrentUser, Roles, Public
│   ├── dto/             # PaginationDto, ApiResponseDto
│   ├── filters/         # AllExceptionsFilter
│   ├── guards/          # JwtAuthGuard, ProviderStoreGuard
│   ├── interceptors/    # TransformInterceptor, LoggingInterceptor
│   └── utils/           # date-helper, slugify
├── config/              # app, database, redis, jwt, storage config
├── database/            # PrismaService, PrismaModule, Seeders
├── modules/
│   ├── auth/            # AuthModule (login, register, jwt strategy)
│   ├── users/           # UsersModule (profile, emergency contact, regions)
│   ├── provider-stores/ # ProviderStoresModule (store management)
│   ├── categories/      # CategoriesModule
│   ├── products/        # ProductsModule (catalog, filter, availability)
│   ├── rental-orders/   # RentalOrdersModule (booking lifecycle, meetups, pricing, extend)
│   ├── reviews/         # ReviewsModule (two-way reputation system)
│   ├── regions/         # RegionsModule (provinces, regencies, districts, villages with Redis cache)
│   ├── faqs/            # FaqsModule
│   └── storage/         # StorageModule (S3 / Multer file upload for signed agreements & bills)
├── app.module.ts
└── main.ts
```

---

## 🗄️ SKEMA DATABASE PRISMA (`schema.prisma`)

Implementasikan skema database berikut pada PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum KycStatus {
  UNVERIFIED
  PENDING_REVIEW
  VERIFIED
}

enum ItemCondition {
  NEW
  LIKE_NEW
  EXCELLENT
}

enum OrderLifecycleStatus {
  PENDING_CONFIRMATION
  CONFIRMED
  ACTIVE_RENTAL
  COMPLETED
  REJECTED
}

enum MeetupLocationType {
  PROVIDER_HUB
  TENANT_ADDRESS
  CUSTOM_MEETUP
}

enum ReviewAuthorRole {
  TENANT
  PROVIDER
}

model User {
  id               String       @id @default(uuid())
  fullName         String       @map("full_name") @db.VarChar(150)
  displayName      String?      @map("display_name") @db.VarChar(100)
  email            String       @unique @db.VarChar(150)
  phone            String       @unique @db.VarChar(20)
  passwordHash     String       @map("password_hash") @db.VarChar(255)
  initials         String?      @db.VarChar(5)
  isKycVerified    Boolean      @default(true) @map("is_kyc_verified")
  kycStatus        KycStatus    @default(VERIFIED) @map("kyc_status")
  hasProviderStore Boolean      @default(false) @map("has_provider_store")
  isActive         Boolean      @default(true) @map("is_active")
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  profile          UserProfile?
  providerStore    ProviderStore?
  rentalOrders     RentalOrder[] @relation("TenantOrders")
  authoredReviews  RentalReview[] @relation("AuthoredReviews")
  receivedReviews  RentalReview[] @relation("ReceivedReviews")

  @@map("users")
}

model UserProfile {
  id                     String   @id @default(uuid())
  userId                 String   @unique @map("user_id")
  profession             String?  @db.VarChar(100)
  companyOrStudio        String?  @map("company_or_studio") @db.VarChar(150)
  socialMediaInstagram   String?  @map("social_media_instagram") @db.VarChar(50)
  provinceId             String?  @map("province_id")
  provinceName           String?  @map("province_name")
  regencyId              String?  @map("regency_id")
  regencyName            String?  @map("regency_name")
  districtId             String?  @map("district_id")
  districtName           String?  @map("district_name")
  villageId              String?  @map("village_id")
  villageName            String?  @map("village_name")
  cityText               String?  @map("city_text") @db.Text
  address                String?  @db.Text
  postalCode             String?  @map("postal_code") @db.VarChar(10)
  emergencyContactName   String?  @map("emergency_contact_name") @db.VarChar(100)
  emergencyPhone         String?  @map("emergency_phone") @db.VarChar(20)
  emergencyRelation      String?  @map("emergency_relation") @db.VarChar(50)
  bio                    String?  @db.Text
  updatedAt              DateTime @updatedAt @map("updated_at")

  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model ProviderStore {
  id           String        @id @default(uuid())
  userId       String        @unique @map("user_id")
  storeName    String        @map("store_name") @db.VarChar(150)
  slug         String        @unique @db.VarChar(150)
  description  String?       @db.Text
  phone        String        @db.VarChar(20)
  email        String?       @db.VarChar(150)
  address      String        @db.Text
  provinceId   String?       @map("province_id")
  regencyId    String?       @map("regency_id")
  rating       Decimal       @default(5.00) @db.Decimal(3, 2)
  reviewCount  Int           @default(0) @map("review_count")
  isVerified   Boolean       @default(true) @map("is_verified")
  isActive     Boolean       @default(true) @map("is_active")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  products     Product[]
  rentalOrders RentalOrder[] @relation("ProviderOrders")

  @@map("provider_stores")
}

model Category {
  id           String    @id @db.VarChar(50)
  code         String    @unique @db.VarChar(50)
  name         String    @db.VarChar(100)
  slug         String    @unique @db.VarChar(100)
  iconName     String?   @map("icon_name") @db.VarChar(50)
  description  String?   @db.Text
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")
  products     Product[]

  @@map("categories")
}

model Product {
  id              String                 @id @db.VarChar(50)
  providerStoreId String                 @map("provider_store_id")
  categoryId      String                 @map("category_id")
  name            String                 @db.VarChar(200)
  slug            String                 @unique @db.VarChar(200)
  description     String                 @db.Text
  dailyRate       Decimal                @map("daily_rate") @db.Decimal(12, 2)
  depositAmount   Decimal                @default(0) @map("deposit_amount") @db.Decimal(12, 2)
  condition       ItemCondition          @default(LIKE_NEW)
  badgeText       String?                @map("badge_text") @db.VarChar(30)
  location        String?                @db.VarChar(100)
  stockTotal      Int                    @default(1) @map("stock_total")
  stockAvailable  Int                    @default(1) @map("stock_available")
  isPublished     Boolean                @default(true) @map("is_published")
  isActive        Boolean                @default(true) @map("is_active")
  createdAt       DateTime               @default(now()) @map("created_at")
  updatedAt       DateTime               @updatedAt @map("updated_at")

  providerStore   ProviderStore          @relation(fields: [providerStoreId], references: [id], onDelete: Cascade)
  category        Category               @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  includedItems   ProductIncludedItem[]
  orderItems      OrderItem[]

  @@map("products")
}

model ProductImage {
  id           String   @id @default(uuid())
  productId    String   @map("product_id")
  imageUrl     String   @map("image_url") @db.Text
  isPrimary    Boolean  @default(false) @map("is_primary")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")

  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductIncludedItem {
  id           String  @id @default(uuid())
  productId    String  @map("product_id")
  itemName     String  @map("item_name") @db.VarChar(200)
  quantity     Int     @default(1)
  displayOrder Int     @default(0) @map("display_order")

  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_included_items")
}

model RentalOrder {
  id                 String               @id @db.VarChar(50)
  tenantUserId       String               @map("tenant_user_id")
  providerStoreId    String               @map("provider_store_id")
  lifecycleStatus    OrderLifecycleStatus @default(PENDING_CONFIRMATION) @map("lifecycle_status")
  bookingNotes       String?              @map("booking_notes") @db.Text
  rejectionReason    String?              @map("rejection_reason") @db.Text
  confirmedAt        DateTime?            @map("confirmed_at")
  completedAt        DateTime?            @map("completed_at")
  signedAgreementUrl String?              @map("signed_agreement_url") @db.Text
  paymentBillUrl     String?              @map("payment_bill_url") @db.Text
  createdAt          DateTime             @default(now()) @map("created_at")
  updatedAt          DateTime             @updatedAt @map("updated_at")

  tenant             User                 @relation("TenantOrders", fields: [tenantUserId], references: [id])
  providerStore      ProviderStore        @relation("ProviderOrders", fields: [providerStoreId], references: [id])
  items              OrderItem[]
  meetup             OrderMeetup?
  pricing            OrderPricing?
  reviews            RentalReview[]

  @@map("rental_orders")
}

model OrderItem {
  id              String      @id @default(uuid())
  orderId         String      @map("order_id")
  productId       String      @map("product_id")
  productName     String      @map("product_name") @db.VarChar(200)
  primaryImageUrl String?     @map("primary_image_url") @db.Text
  quantity        Int         @default(1)
  rentalDays      Int         @map("rental_days")
  startDate       DateTime    @map("start_date") @db.Date
  endDate         DateTime    @map("end_date") @db.Date
  dailyRate       Decimal     @map("daily_rate") @db.Decimal(12, 2)
  depositRate     Decimal     @default(0) @map("deposit_rate") @db.Decimal(12, 2)
  totalAmount     Decimal     @map("total_amount") @db.Decimal(12, 2)
  createdAt       DateTime    @default(now()) @map("created_at")

  order           RentalOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product     @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model OrderMeetup {
  id              String             @id @default(uuid())
  orderId         String             @unique @map("order_id")
  locationType    MeetupLocationType @default(PROVIDER_HUB) @map("location_type")
  locationName    String             @map("location_name") @db.VarChar(150)
  locationAddress String             @map("location_address") @db.Text
  scheduleDate    DateTime           @map("schedule_date") @db.Date
  scheduleTime    String             @map("schedule_time") @db.VarChar(20)
  notes           String?            @db.Text
  createdAt       DateTime           @default(now()) @map("created_at")

  order           RentalOrder        @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_meetups")
}

model OrderPricing {
  id             String      @id @default(uuid())
  orderId        String      @unique @map("order_id")
  subtotalRental Decimal     @map("subtotal_rental") @db.Decimal(12, 2)
  totalDeposit   Decimal     @default(0) @map("total_deposit") @db.Decimal(12, 2)
  deliveryFee    Decimal     @default(0) @map("delivery_fee") @db.Decimal(12, 2)
  grandTotal     Decimal     @map("grand_total") @db.Decimal(12, 2)
  createdAt      DateTime    @default(now()) @map("created_at")

  order          RentalOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_pricings")
}

model RentalReview {
  id            String           @id @default(uuid())
  orderId       String           @map("order_id")
  authorUserId  String           @map("author_user_id")
  targetUserId  String           @map("target_user_id")
  authorRole    ReviewAuthorRole @map("author_role")
  overallRating Int              @map("overall_rating")
  comment       String?          @db.Text
  tags          Json?
  createdAt     DateTime         @default(now()) @map("created_at")

  order         RentalOrder      @relation(fields: [orderId], references: [id], onDelete: Cascade)
  author        User             @relation("AuthoredReviews", fields: [authorUserId], references: [id])
  target        User             @relation("ReceivedReviews", fields: [targetUserId], references: [id])

  @@map("rental_reviews")
}
```

---

## 🎯 DAFTAR ENDPOINT & ATURAN BISNIS YANG WAJIB DIIMPLEMENTASIKAN

### 1. Autentikasi & Pengguna (`/api/v1/auth`, `/api/v1/user`)
- `POST /api/v1/auth/login` : Login identifier (email/phone) + password $\rightarrow$ Return JWT + User data + `hasProviderStore: boolean`.
- `POST /api/v1/auth/register` : Register akun baru (Nama KTP, Phone, Email, Password) $\rightarrow$ Default `hasProviderStore = false`.
- `GET /api/v1/user/profile` : Mengambil data diri, domisili, dan kontak darurat.
- `PUT /api/v1/user/profile` : Memperbarui biodata, kontak darurat, dan wilayah administratif.

### 2. Katalog Produk (`/api/v1/products`)
- `GET /api/v1/products` : Filter kategori, pencarian teks, sort (`popular`, `price_asc`, `price_desc`, `rating`, `newest`), paginasi. Gunakan Redis Cache (TTL 10 menit).
- `GET /api/v1/products/:id` : Detail produk, spesifikasi unit, paket kelengkapan (`includedItems`), profil toko penyedia, dan ulasan.

### 3. Reservasi & Pesanan Penyewa (`/api/v1/bookings`, `/api/v1/orders`)
- `POST /api/v1/bookings` : Submit booking (array of items, meetup location & schedule, customer info). Generate Order ID `EPS-YYYYMMDD-XXXX`, status awal `PENDING_CONFIRMATION`.
- `GET /api/v1/orders/my-orders` : Mengambil riwayat booking penyewa dengan filter tab (`ALL`, `PENDING`, `ACTIVE`, `COMPLETED`, `REJECTED`).
- `POST /api/v1/orders/:id/extend` : Perpanjang durasi sewa (+N hari) saat unit aktif. Recalculate `rentalDays`, `endDate`, dan `grandTotal`.
- `POST /api/v1/orders/:id/review` : Penyewa submit rating & ulasan untuk penyedia sewa.

### 4. Panel Mitra Penyedia Sewa (`/api/v1/provider/orders`)
> *Protected Guard: `ProviderStoreGuard` (hanya user dengan `hasProviderStore: true`).*
- `GET /api/v1/provider/orders` : Mengambil antrean timeline pesanan toko penyedia.
- `PUT /api/v1/provider/orders/:id/confirm` : Terima booking $\rightarrow$ Status berubah menjadi `CONFIRMED`.
- `PUT /api/v1/provider/orders/:id/reject` : Tolak booking disertai alasan (`rejectionReason`) $\rightarrow$ Status `REJECTED`.
- `POST /api/v1/provider/orders/:id/upload-documents` : Upload `multipart/form-data` untuk foto/PDF Surat Perjanjian Sewa TTD (`signedAgreementFile`) dan kuitansi pelunasan (`paymentBillFile`). Status berubah ke `ACTIVE_RENTAL`.
- `PUT /api/v1/provider/orders/:id/complete` : Selesaikan sewa (hanya bisa jika berkas TTD/bill sudah diunggah) $\rightarrow$ Status `COMPLETED`.
- `POST /api/v1/provider/orders/:id/review-tenant` : Penyedia memberikan rating reputasi penyewa.

### 5. Wilayah Administratif & Master Data (`/api/v1/regions`, `/api/v1/faqs`)
- `GET /api/v1/regions?type=provinces|regencies|districts|villages&parentId=...` : Cascading wilayah Indonesia dengan Redis cache (TTL 24 jam).
- `GET /api/v1/faqs` : Daftar tanya-jawab prosedur booking dan serah terima unit di tempat.

---

## ⚡ INSTRUKSI EKSEKUSI
1. Mulai dengan membuat `package.json`, `tsconfig.json`, dan file konfigurasi NestJS.
2. Setup file `prisma/schema.prisma` dan script migrasi serta seeding data awal (`prisma/seed.ts`).
3. Buat seluruh Modules, DTOs, Guards, Interceptors, Controllers, dan Services sesuai spesifikasi di atas secara bertahap dan rapi.
4. Sertakan file `.env.example` dan `docker-compose.yml` untuk PostgreSQL + Redis.
```
