# MASTER PROMPT: PENGEMBANGAN BACKEND API SERVICE (e-punyasewa)

Anda adalah seorang Senior Backend Architect & NestJS Expert. Tugas Anda adalah membangun dan menyempurnakan backend API Service untuk platform "e-punyasewa" (Platform Informasi & Reservasi Sewa Perlengkapan Modern).

---

## 🛠️ SPESIFIKASI TECH STACK
* **Framework:** NestJS v10+ (Node.js 20+ LTS, TypeScript Strict Mode).
* **Database & ORM:** PostgreSQL 16+ dengan Prisma ORM.
* **Cache & Queue:** Redis 7+ (`@nestjs/cache-manager`, `ioredis`, `@nestjs/bullmq`).
* **Keamanan:** JWT (`@nestjs/jwt`, `passport-jwt`), `argon2` password hashing, `helmet`, `@nestjs/throttler`.
* **Dokumentasi:** OpenAPI / Swagger (`@nestjs/swagger`) di rute `/api/docs`.

---

## 🗄️ SKEMA DATABASE PRISMA LENGKAP (`schema.prisma`)

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
  cartItems        CartItem[]
  favorites        UserFavorite[]

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

model CartItem {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  productId   String   @map("product_id")
  quantity    Int      @default(1)
  rentalDays  Int      @default(1) @map("rental_days")
  startDate   DateTime @map("start_date") @db.Date
  endDate     DateTime @map("end_date") @db.Date
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("cart_items")
}

model UserFavorite {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  productId   String   @map("product_id")
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("user_favorites")
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
  cartItems       CartItem[]
  favorites       UserFavorite[]

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

## 🎯 DAFTAR ENDPOINT MODUL TAMBAHAN (CART & FAVORITES)

### Modul 7: Keranjang Sewa (`/api/v1/cart`)
- `GET /api/v1/cart` : Mengambil daftar item keranjang aktif user login.
- `POST /api/v1/cart/items` : Menambahkan item sewa ke keranjang (`{ productId, quantity, startDate, endDate }`).
- `PUT /api/v1/cart/items/:id` : Mengubah quantity atau rentang tanggal sewa item.
- `DELETE /api/v1/cart/items/:id` : Menghapus 1 item dari keranjang.
- `DELETE /api/v1/cart` : Mengosongkan keranjang sewa user.

### Modul 8: Produk Favorit (`/api/v1/favorites`)
- `GET /api/v1/favorites` : Mengambil daftar unit favorit user login.
- `POST /api/v1/favorites/toggle` : Menambah / menghapus unit dari favorit (Toggle Status).
- `DELETE /api/v1/favorites/:productId` : Menghapus unit dari daftar favorit.
