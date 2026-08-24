# Dokumentasi & Project Memory: e-punyasewa Platform

Dokumentasi lengkap arsitektur, identitas, design system (Muted Sky & Sage Theme: Light & Dark Mode), dan panduan teknis untuk platform **e-punyasewa**.

---

## 📌 Disclaimer & Referensi
- Konsep awal HANYA merupakan referensi visual, tata letak (*layout*), dan inspirasi UI.
- Semua nama brand, identitas aplikasi, skema data, dan fitur dibangun secara mandiri khusus untuk platform **e-punyasewa**.

---

## 🏗️ Tech Stack & Arsitektur (Vue 3 + Tailwind CSS)
- **Framework:** Vue 3 (Composition API + TypeScript) + Vite
- **Styling:** Tailwind CSS + Semantic CSS Variables (`:root` / `.dark`)
- **Theme Management:** `useTheme.ts` (Toggle Light/Dark + LocalStorage Persistence)
- **Pola Arsitektur:** Clean Architecture / Hexagonal
  - `Domain Layer`: Entities (`Product`, `RentalBooking`, `CartItem`), Value Objects (`Money`, `DateRange`), Enums (`RentalStatus`, `ProductCategory`).
  - `Application Layer`: Use Cases (`CalculateRentalPriceUseCase`, `GetProductsUseCase`, `ManageCartUseCase`).
  - `Infrastructure Layer`: `MockProductRepository`, `LocalStorageCartRepository`, `LocalStorageAdapter`, DI Container.
  - `Presentation Layer`: Vue 3 Components, Composables (`useProducts`, `useRentalCalculator`, `useCart`, `useWishlist`, `useTheme`).
  - `Core Layer`: Centralized Error Handling (`BaseException`, `RentalException`), App Config & Constants.

---

## 🎨 Design System & Color Tokens (Warm Espresso & Forest Sage Theme)

### Light Mode:
- `Page Background`: `#FBF9F5` (Warm Alabaster / Soft Linen)
- `Card Background`: `#FFFFFF` (Pure Off-White)
- `Primary Text`: `#1C1917` (Deep Warm Umber / Warm Espresso)
- `Secondary Text`: `#78716C` (Warm Taupe)
- `Primary CTA`: `#3D634C` (Rich Forest Sage) -> Hover: `#2F4D3B`
- `Accent Terracotta`: `#C88A58` (Warm Terracotta)
- `Borders`: `#E7E5E4` (Soft Stone)

### Dark Mode:
- `Page Background`: `#141211` (Deep Espresso Smoke)
- `Card Background`: `#1F1C1B` (Warm Dark Slate / Espresso Card)
- `Primary Text`: `#F5F5F4` (Warm Cream White)
- `Secondary Text`: `#A8A29E` (Soft Stone Ash)
- `Primary CTA`: `#82A78F` (Soft Glowing Sage) -> Hover: `#6C9479`
- `Accent Terracotta`: `#E09F67` (Warm Amber Clay)
- `Borders`: `#2E2A28` (Warm Charcoal Edge)

---

## 🚀 Fitur Utama & Modul (Fase 1)
1. **Navigasi & Header:** Glass header dengan logo `e-punyasewa`, tombol switch tema (☀️/🌙), navigasi kategori, search input, wishlist counter, dan cart drawer trigger.
2. **Hero & Value Props:** Headline *"ELEVATE YOUR EXPERIENCE"*, 4 pilar jaminan sewa (Unit Bersih, Deposit Cepat, Asuransi, Pickup Fleksibel).
3. **Katalog & Kategori Sewa:** Kategori (Kamera & Lensa, Drone & Audio, Outdoor & Camping, Gadget & Laptop, Fashion & Acara).
4. **Modal Detail & Date Picker:** Kalender tanggal sewa interaktif, kalkulasi real-time durasi hari sewa + jaminan deposit.
5. **Slide-over Cart Drawer:** List item sewa, kontrol durasi, kalkulasi total tarif sewa & deposit, serta tombol checkout.

---

## 💎 Custom SVG Icon Design System (`src/presentation/components/icons/`)
- **Format:** Pure Scalable Vector Graphics (SVG) Vue Components (0% pixelation di 4K/Retina, ukuran sub-kilobyte, reaktif dengan Tailwind `currentColor`, strokeWidth, dan class).
- **Icon Set Asli (Original):**
  - `IconLogo`: Emblem kubus isometrik sewa dengan loop pengembalian sirkular.
  - Kategori: `IconCategoryAll`, `IconCategoryCamera`, `IconCategoryDrone`, `IconCategoryOutdoor`, `IconCategoryGadget`, `IconCategoryFashion`.
  - Nilai Jaminan & Kepercayaan: `IconShieldCheck` (QC 100%), `IconRefundDeposit` (Refund Deposit), `IconInsurance` (Proteksi Asuransi), `IconDeliveryTruck` (Kurir & Pickup).
  - UI & Aksi: `IconSearch`, `IconHeartWishlist`, `IconCartBag`, `IconThemeMonitor`, `IconThemeSun`, `IconThemeMoon`, `IconCalendarDate`, `IconUser`, `IconStar`, `IconLocation`, `IconArrowRight`, `IconChevronDown`, `IconCheck`, `IconClose`, `IconTrash`, `IconBoxPackage`, `IconMenu`.

