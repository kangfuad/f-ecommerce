# 🚀 Arsitektur Database & Spesifikasi API Service (FE Front Office)
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

## 📊 1. ENTITY RELATIONSHIP DIAGRAM (ERD) & RELASI TABEL

Berikut adalah diagram relasi entitas database relasional (PostgreSQL) lengkap untuk backend e-punyasewa:

```mermaid
erDiagram
    USERS ||--|| USER_PROFILES : "has profile"
    USERS ||--o| PROVIDER_STORES : "owns provider store"
    USERS ||--o{ RENTAL_ORDERS : "places as tenant"
    USERS ||--o{ RENTAL_REVIEWS : "authors / receives"
    USERS ||--o{ CART_ITEMS : "stores in cart"
    USERS ||--o{ USER_FAVORITES : "bookmarks"
    
    PROVIDER_STORES ||--o{ PRODUCTS : "lists inventory"
    PROVIDER_STORES ||--o{ RENTAL_ORDERS : "receives orders"
    
    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has gallery"
    PRODUCTS ||--o{ PRODUCT_INCLUDED_ITEMS : "includes gear"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    PRODUCTS ||--o{ CART_ITEMS : "added to cart"
    PRODUCTS ||--o{ USER_FAVORITES : "favorited"
    
    RENTAL_ORDERS ||--|{ ORDER_ITEMS : "contains items"
    RENTAL_ORDERS ||--|| ORDER_MEETUPS : "has meetup schedule"
    RENTAL_ORDERS ||--|| ORDER_PRICINGS : "has pricing breakdown"
    RENTAL_ORDERS ||--o{ RENTAL_REVIEWS : "evaluated in"

    USERS {
        uuid id PK
        varchar full_name
        varchar display_name
        varchar email UK
        varchar phone UK
        varchar password_hash
        varchar initials
        boolean is_kyc_verified
        varchar kyc_status
        boolean has_provider_store
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    USER_PROFILES {
        uuid id PK
        uuid user_id FK "1:1 with USERS"
        varchar profession
        varchar company_or_studio
        varchar social_media_instagram
        varchar province_id
        varchar province_name
        varchar regency_id
        varchar regency_name
        varchar district_id
        varchar district_name
        varchar village_id
        varchar village_name
        text city_text
        text address
        varchar postal_code
        varchar emergency_contact_name
        varchar emergency_phone
        varchar emergency_relation
        text bio
        timestamp updated_at
    }

    CART_ITEMS {
        uuid id PK
        uuid user_id FK
        varchar product_id FK
        int quantity
        int rental_days
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
    }

    USER_FAVORITES {
        uuid id PK
        uuid user_id FK
        varchar product_id FK
        timestamp created_at
    }

    PROVIDER_STORES {
        uuid id PK
        uuid user_id FK "1:1 with USERS"
        varchar store_name
        varchar slug UK
        text description
        varchar phone
        varchar email
        text address
        varchar province_id
        varchar regency_id
        decimal rating
        int review_count
        boolean is_verified
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        varchar id PK
        varchar code UK
        varchar name
        varchar slug UK
        varchar icon_name
        text description
        int display_order
        boolean is_active
    }

    PRODUCTS {
        varchar id PK
        uuid provider_store_id FK
        varchar category_id FK
        varchar name
        varchar slug UK
        text description
        decimal daily_rate
        decimal deposit_amount
        varchar condition
        varchar badge_text
        varchar location
        int stock_total
        int stock_available
        boolean is_published
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_IMAGES {
        uuid id PK
        varchar product_id FK
        text image_url
        boolean is_primary
        int display_order
        timestamp created_at
    }

    PRODUCT_INCLUDED_ITEMS {
        uuid id PK
        varchar product_id FK
        varchar item_name
        int quantity
        int display_order
    }

    RENTAL_ORDERS {
        varchar id PK
        uuid tenant_user_id FK
        uuid provider_store_id FK
        varchar lifecycle_status
        text booking_notes
        text rejection_reason
        timestamp confirmed_at
        timestamp completed_at
        text signed_agreement_url
        text payment_bill_url
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        varchar order_id FK
        varchar product_id FK
        varchar product_name
        text primary_image_url
        int quantity
        int rental_days
        date start_date
        date end_date
        decimal daily_rate
        decimal deposit_rate
        decimal total_amount
        timestamp created_at
    }

    ORDER_MEETUPS {
        uuid id PK
        varchar order_id FK
        varchar location_type
        varchar location_name
        text location_address
        date schedule_date
        varchar schedule_time
        text notes
        timestamp created_at
    }

    ORDER_PRICINGS {
        uuid id PK
        varchar order_id FK
        decimal subtotal_rental
        decimal total_deposit
        decimal delivery_fee
        decimal grand_total
        timestamp created_at
    }

    RENTAL_REVIEWS {
        uuid id PK
        varchar order_id FK
        uuid author_user_id FK
        uuid target_user_id FK
        varchar author_role
        int overall_rating
        text comment
        jsonb tags
        timestamp created_at
    }
```

---

## 📑 2. DAFTAR LENGKAP ENDPOINT API (8 MODUL)

### MODUL 1: AUTENTIKASI & PROFIL PENGGUNA
* `POST /api/v1/auth/login` : Login kredensial (Email / WhatsApp & Password).
* `POST /api/v1/auth/register` : Registrasi akun penyewa baru.
* `GET /api/v1/user/profile` : Mengambil data diri, profesi, domisili, dan kontak darurat.
* `PUT /api/v1/user/profile` : Memperbarui data profil lengkap.

### MODUL 2: KATALOG & KATEGORI PRODUK
* `GET /api/v1/categories` : Daftar kategori unit sewa.
* `GET /api/v1/products` : Filter multi-parameter, search, dan pagination.
* `GET /api/v1/products/:idOrSlug` : Detail unit perlengkapan sewa.
* `GET /api/v1/provider-stores/:id` : Profil toko mitra penyedia.

### MODUL 3: RESERVASI & PESANAN PENYEWA
* `POST /api/v1/bookings` : Submit booking sewa unit baru.
* `GET /api/v1/orders/my-orders` : Riwayat booking penyewa (Filter status: `ALL`, `PENDING`, `ACTIVE`, `COMPLETED`, `REJECTED`).
* `POST /api/v1/orders/:id/extend` : Perpanjang durasi sewa (+N hari).
* `POST /api/v1/orders/:id/review` : Ulasan & rating penyewa untuk penyedia sewa.

### MODUL 4: PANEL MITRA PENYEDIA SEWA
* `GET /api/v1/provider/orders` : Timeline antrean pesanan masuk toko penyedia.
* `PUT /api/v1/provider/orders/:id/confirm` : Terima booking unit.
* `PUT /api/v1/provider/orders/:id/reject` : Tolak booking disertai alasan.
* `POST /api/v1/provider/orders/:id/upload-documents` : Upload berkas perjanjian TTD & kuitansi pelunasan (`multipart/form-data`).
* `PUT /api/v1/provider/orders/:id/complete` : Selesaikan sewa dan tutup transaksi.
* `POST /api/v1/provider/orders/:id/review-tenant` : Penyedia memberi review reputasi penyewa.

### MODUL 5: WILAYAH & DATA MASTER
* `GET /api/v1/regions/provinces` : Seluruh provinsi Indonesia.
* `GET /api/v1/regions/provinces/:id/regencies` : Kota/Kabupaten by ID Provinsi.
* `GET /api/v1/regions/regencies/:id/districts` : Kecamatan by ID Kota/Kab.
* `GET /api/v1/regions/districts/:id/villages` : Kelurahan by ID Kecamatan.
* `GET /api/v1/faqs` : Daftar tanya jawab resmi.

### MODUL 6: MEDIA & FILE STORAGE
* `POST /api/v1/storage/upload` : Upload berkas PDF / Gambar fisik ke server.

### MODUL 7: KERANJANG SEWA PENGGUNA (DATABASE CART)
* `GET /api/v1/cart` : Mengambil daftar item keranjang sewa milik user yang sedang login.
* `POST /api/v1/cart/items` : Menambahkan item sewa ke keranjang (`{ productId, quantity, startDate, endDate }`).
* `PUT /api/v1/cart/items/:id` : Mengubah jumlah unit (`quantity`) atau rentang tanggal sewa.
* `DELETE /api/v1/cart/items/:id` : Menghapus 1 item dari keranjang sewa.
* `DELETE /api/v1/cart` : Mengosongkan seluruh keranjang sewa user.

### MODUL 8: PRODUK FAVORIT (DATABASE WISHLIST)
* `GET /api/v1/favorites` : Mengambil seluruh unit favorit milik user yang login.
* `POST /api/v1/favorites/toggle` : Menambah / menghapus produk dari favorit (Toggle Status).
* `DELETE /api/v1/favorites/:productId` : Menghapus unit dari daftar favorit.
