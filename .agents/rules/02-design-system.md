# Design System & Theme Guidelines: e-punyasewa (Warm Espresso & Forest Sage)

Standar sistem warna, token CSS variables, tipografi, sistem icon SVG original, dan implementasi komponen UI untuk platform **e-punyasewa** yang mendukung **Light Mode** dan **Dark Mode** secara dinamis dan memenuhi standar aksesibilitas WCAG AA dengan nuansa *Organic Luxury & Editorial Rental*.

---

## 1. Color Palette (Warm Espresso & Forest Sage Theme)

### A. LIGHT MODE (Default)
| Token / Semantic | Hex Code | Nama Warna & Penggunaan |
| :--- | :--- | :--- |
| `--color-bg-page` / `theme-page` | `#FBF9F5` | **Page Background (Dominan)**: Warm Alabaster / Soft Linen |
| `--color-bg-card` / `theme-card` | `#FFFFFF` | **Card / Container Background**: Pure Off-White |
| `--color-bg-card-hover` | `#F5F1E8` | **Card Hover Background**: Warm Linen Hover |
| `--color-text-primary` / `theme-primary` | `#1C1917` | **Primary Text**: Deep Warm Umber / Warm Espresso |
| `--color-text-muted` / `theme-muted` | `#78716C` | **Secondary Text / Muted**: Warm Taupe |
| `--color-cta` / `theme-cta` | `#3D634C` | **Primary CTA / Button**: Rich Forest Sage |
| `--color-cta-hover` | `#2F4D3B` | **Hover / Active CTA**: Deep Pine Sage |
| `--color-accent-terracotta` / `theme-terracotta` | `#C88A58` | **Secondary Accent / Tag**: Warm Terracotta |
| `--color-border` / `theme-border` | `#E7E5E4` | **Borders / Dividers**: Soft Stone |

### B. DARK MODE
| Token / Semantic | Hex Code | Nama Warna & Penggunaan |
| :--- | :--- | :--- |
| `--color-bg-page` / `theme-page` | `#141211` | **Page Background (Dominan)**: Deep Espresso Smoke (Warm Luxury) |
| `--color-bg-card` / `theme-card` | `#1F1C1B` | **Card / Container Background**: Warm Dark Slate / Espresso Card |
| `--color-bg-card-hover` | `#2A2624` | **Card Hover Background**: Elevated Warm Stone |
| `--color-text-primary` / `theme-primary` | `#F5F5F4` | **Primary Text**: Warm Cream White (Nyaman di mata) |
| `--color-text-muted` / `theme-muted` | `#A8A29E` | **Secondary Text / Muted**: Soft Stone Ash |
| `--color-cta` / `theme-cta` | `#82A78F` | **Primary CTA / Button**: Soft Glowing Sage |
| `--color-cta-hover` | `#6C9479` | **Hover / Active CTA**: Deep Glow Sage |
| `--color-accent-terracotta` / `theme-terracotta` | `#E09F67` | **Secondary Accent / Tag**: Warm Amber Clay |
| `--color-border` / `theme-border` | `#2E2A28` | **Borders / Dividers**: Warm Charcoal Edge |

---

## 2. Tipografi (Typography)
- **Display Headings (`font-display`):** `'Playfair Display', serif`
  - Headline Hero: **"ELEVATE YOUR EXPERIENCE"**
- **Body & UI Controls (`font-sans`):** `'Plus Jakarta Sans', sans-serif`

---

## 3. Penerapan Kelas Tailwind & CSS Variables
- **Sistem Tema:** Dikelola secara reaktif menggunakan composable `useTheme.ts` dan kelas `.dark` pada `<html>`.
- **Penggunaan Kelas Semantik:**
  - Latar Halaman: `bg-theme-page`
  - Kontainer Kartu / Modal / Drawer: `bg-theme-card`
  - Teks Utama / Judul: `text-theme-primary`
  - Teks Sekunder / Label: `text-theme-muted`
  - Tombol CTA: `bg-theme-cta hover:bg-theme-cta-hover text-theme-cta-text`
  - Garis Pembatas: `border-theme-border`

---

## 4. Standar & Aturan Penggunaan Icon (Icon System Guidelines)

### A. Aturan Wajib (Mandatory Rules):
1. **100% Original & Mandiri:** Semua icon pada platform **e-punyasewa** harus dibuat sendiri sebagai komponen SVG Vue murni di folder `@/presentation/components/icons/`.
2. **Dilarang Icon Library Eksternal / Font Icons:** Jangan menginstal atau mengimpor icon library eksternal (seperti Lucide, FontAwesome, Heroicons, Material Icons dsb.) atau menggunakan emoji sebagai icon UI utama.
3. **Format Standar SVG Component:**
   - Menggunakan `viewBox="0 0 24 24"`.
   - Menggunakan `fill="none"` dan `stroke="currentColor"`.
   - Menggunakan `stroke-linecap="round"` dan `stroke-linejoin="round"`.
   - Mendukung props fleksibel: `size` (number/string, default 20/16/14) dan `strokeWidth` (default 2 atau 2.2).
   - Menyertakan atribut aksesibilitas `aria-hidden="true"`.
4. **Barrel Export Centralization:** Setiap icon baru WAJIB didaftarkan dan diekspor melalui [`src/presentation/components/icons/index.ts`](file:///Users/auri/fuad/LATIHAN/ecommerce/src/presentation/components/icons/index.ts).
5. **Pewarnaan Dinamis:** Hindari hardcode warna hex pada path/stroke di dalam komponen icon kecuali untuk accent khusus. Biarkan mewarisi warna dari elemen induk via `currentColor` atau kelas utilitas Tailwind (`text-sage`, `text-theme-muted`, `text-coral`, dsb.).

### B. Daftar Icon Resmi & Kategori:
- **Brand Identity:** `IconLogo`
- **Kategori Sewa:** `IconCategoryAll`, `IconCategoryCamera`, `IconCategoryDrone`, `IconCategoryOutdoor`, `IconCategoryGadget`, `IconCategoryFashion`
- **Pilar Kepercayaan & Jaminan:** `IconShieldCheck`, `IconRefundDeposit`, `IconInsurance`, `IconDeliveryTruck`
- **Navigasi & Interaksi:** `IconSearch`, `IconHeartWishlist`, `IconCartBag`, `IconThemeMonitor`, `IconThemeSun`, `IconThemeMoon`, `IconCalendarDate`, `IconUser`, `IconStar`, `IconLocation`, `IconArrowRight`, `IconChevronDown`, `IconCheck`, `IconClose`, `IconTrash`, `IconBoxPackage`, `IconMenu`
