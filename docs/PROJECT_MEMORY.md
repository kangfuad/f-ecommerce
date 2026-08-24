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

## 🎨 Design System & Color Tokens (Muted Sky & Sage Theme)

### Light Mode:
- `Page Background`: `#F8FAFC` (Ice White)
- `Card Background`: `#FFFFFF` (Pure White)
- `Primary Text`: `#0F172A` (Deep Navy)
- `Secondary Text`: `#64748B` (Slate Blue Gray)
- `Primary CTA`: `#84A98C` (Sage Green) -> Hover: `#6B8E73`
- `Accent Blue`: `#3B82F6` (Soft Dusty Blue)
- `Borders`: `#E2E8F0` (Subtle Gray)

### Dark Mode:
- `Page Background`: `#1A1A1A` (Deep Charcoal - *Bukan #000000*)
- `Card Background`: `#262626` (Muted Slate Gray)
- `Primary Text`: `#F8FAFC` (Off-White Cream)
- `Secondary Text`: `#A1A1AA` (Soft Ash Gray)
- `Primary CTA`: `#9DC89F` (Adapted Soft Sage) -> Hover: `#84A98C`
- `Accent Blue`: `#3B82F6` (Soft Dusty Blue)
- `Borders`: `#3F3F46` (Dark Slate Gray)

---

## 🚀 Fitur Utama & Modul (Fase 1)
1. **Navigasi & Header:** Glass header dengan logo `e-punyasewa`, tombol switch tema (☀️/🌙), navigasi kategori, search input, wishlist counter, dan cart drawer trigger.
2. **Hero & Value Props:** Headline *"ELEVATE YOUR EXPERIENCE"*, 4 pilar jaminan sewa (Unit Bersih, Deposit Cepat, Asuransi, Pickup Fleksibel).
3. **Katalog & Kategori Sewa:** Kategori (Kamera & Lensa, Drone & Audio, Outdoor & Camping, Gadget & Laptop, Fashion & Acara).
4. **Modal Detail & Date Picker:** Kalender tanggal sewa interaktif, kalkulasi real-time durasi hari sewa + jaminan deposit.
5. **Slide-over Cart Drawer:** List item sewa, kontrol durasi, kalkulasi total tarif sewa & deposit, serta tombol checkout.
