# Standar Teknis & Konvensi Kode: e-punyasewa

Panduan teknis bagi agen AI dan pengembang dalam memelihara dan menulis kode pada platform **e-punyasewa**.

---

## 1. Tech Stack & Arsitektur Utama
- **Core Framework:** Vue 3 (Composition API + `<script setup lang="ts">`) + Vite.
- **Styling:** Tailwind CSS + Warm Espresso & Forest Sage tokens (`:root` / `.dark`).
- **Iconography:** 100% Original SVG Component System (`src/presentation/components/icons/`).
- **Pola Arsitektur:** Clean Architecture (Hexagonal / Layered):
  - `src/domain/`: Entities, Value Objects, Enums, Domain Exceptions.
  - `src/application/`: Use Cases / Business Services, Repository Contracts.
  - `src/infrastructure/`: Repository Implementations, LocalStorage Adapter, DI Container.
  - `src/presentation/`: Vue Components, Composables (Controllers/ViewModels), Styles, Icons.
  - `src/core/`: Global Config, Centralized Error Handling, Helpers.

---

## 2. Standar Icon & Asset UI (Icon System & No-Emoji Rules)
1. **Original SVG Only:** Seluruh icon harus berupa komponen SVG Vue mandiri (`.vue`) yang tersimpan di `src/presentation/components/icons/`.
2. **Tanpa Library Pihak Ketiga:** Dilarang menginstal atau mengimpor icon library luar (Lucide, FontAwesome, Material Icons, dsb.).
3. **Dilarang Emoticon Generik AI (Strict No-Emoji Rule):** Dilarang keras menggunakan emoticon Unicode (`✨`, `🎉`, `🚀`, `📦`, `💡`, `🛡️`, `🔒`, `⚠️`, `⚡`, dll.) pada UI teks, badge, tombol, maupun notifikasi. Gunakan tipografi editorial berkelas atau komponen SVG Icon.
4. **Pewarnaan Dinamis:** Komponen icon menggunakan `stroke="currentColor"` dan `fill="none"` (kecuali aksen khusus) sehingga responsif terhadap perubahan tema Light/Dark.
5. **Sentralisasi Import:** Seluruh import icon dilakukan via barrel export `@/presentation/components/icons`.

---

## 3. Fokus Fase 1: UI/UX Excellence & Interactive Rental Flow
1. **Visual Excellence (Aesthetics First):**
   - Menggunakan tema *Warm Espresso & Forest Sage* (Light Mode & Dark Mode dengan Deep Espresso Smoke `#141211`).
   - Tipografi: *Plus Jakarta Sans* untuk UI jernih & *Playfair Display* untuk sentuhan editorial mewah.
   - Micro-animations: *Staggered fade-in*, *card hover elevation*, *drawer slide-over*, *badge pulsing*.
2. **Interactive Rental Experience:**
   - **Date Range Picker:** Memilih tanggal mulai dan selesai sewa secara interaktif.
   - **Kalkulator Sewa & Jaminan Deposit Real-time:** Menghitung durasi hari/minggu, diskon otomatis, dan *refundable deposit*.
   - **Slide-over Cart Drawer:** Pengalaman keranjang modern tanpa reload halaman, penghitungan subtotal & jaminan.
   - **Filter & Kategori Interaktif:** Pengelompokan barang sewa (Kamera, Drone, Outdoor, Gadget, Fashion).

---

## 4. Prinsip Kode & Clean Code (SOLID)
- **SRP (Single Responsibility):** Pisahkan komponen UI presentasi dari logika perhitungan sewa (gunakan composables & use cases).
- **No Magic Numbers / Strings:** Semua tarif sewa default, batas gratis ongkir/asuransi, dan status sewa didefinisikan dalam `src/core/config/app.config.ts` dan Enums.
- **Dependency Injection:** Gunakan DI Container untuk inject repositori ke dalam composable/use cases sehingga mudah di-mock dan diuji.
- **Centralized Error Handling:** Tangkap error validasi tanggal, durasi sewa, atau stok menggunakan Custom Exception terpusat.

---

## 5. Manajemen State & Penyimpanan Lokal
- Gunakan `localStorage` untuk persistensi data frontend:
  - `eps_color_theme`: Preferensi tema pengguna (`system`, `light`, `dark`).
  - `eps_cart`: Daftar item sewa, durasi tanggal sewa, kuantitas, dan deposit.
  - `eps_wishlist`: Daftar ID barang favorit.
  - `eps_user`: Simulasi sesi pengguna.
