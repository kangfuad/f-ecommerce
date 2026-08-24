# Design System & Theme Guidelines: e-punyasewa (Muted Sky & Sage Theme)

Standar sistem warna, token CSS variables, tipografi, sistem icon SVG original, dan implementasi komponen UI untuk platform **e-punyasewa** yang mendukung **Light Mode** dan **Dark Mode** secara dinamis dan memenuhi standar aksesibilitas WCAG AA.

---

## 1. Color Palette (Muted Sky & Sage Theme)

### A. LIGHT MODE (Default)
| Token / Semantic | Hex Code | Nama Warna & Penggunaan |
| :--- | :--- | :--- |
| `--color-bg-page` / `theme-page` | `#F8FAFC` | **Page Background (Dominan)**: Ice White |
| `--color-bg-card` / `theme-card` | `#FFFFFF` | **Card / Container Background**: Pure White |
| `--color-text-primary` / `theme-primary` | `#0F172A` | **Primary Text**: Deep Navy (Kontras tinggi & tajam) |
| `--color-text-muted` / `theme-muted` | `#64748B` | **Secondary Text / Muted**: Slate Blue Gray |
| `--color-cta` / `theme-cta` | `#84A98C` | **Primary CTA / Button**: Sage Green |
| `--color-cta-hover` | `#6B8E73` | **Hover / Active CTA**: Darker Sage |
| `--color-accent-blue` / `theme-blue` | `#3B82F6` | **Secondary Accent / Tag**: Soft Dusty Blue |
| `--color-border` / `theme-border` | `#E2E8F0` | **Borders / Dividers**: Subtle Gray |

### B. DARK MODE
| Token / Semantic | Hex Code | Nama Warna & Penggunaan |
| :--- | :--- | :--- |
| `--color-bg-page` / `theme-page` | `#1A1A1A` | **Page Background (Dominan)**: Deep Charcoal (*Bukan #000000 murni*) |
| `--color-bg-card` / `theme-card` | `#262626` | **Card / Container Background**: Muted Slate Gray (Layer kontras lembut) |
| `--color-text-primary` / `theme-primary` | `#F8FAFC` | **Primary Text**: Off-White Cream (Nyaman di mata) |
| `--color-text-muted` / `theme-muted` | `#A1A1AA` | **Secondary Text / Muted**: Soft Ash Gray |
| `--color-cta` / `theme-cta` | `#9DC89F` | **Primary CTA / Button**: Adapted Soft Sage (Glowing lembut) |
| `--color-cta-hover` | `#84A98C` | **Hover / Active CTA**: Sage Green |
| `--color-accent-blue` / `theme-blue` | `#3B82F6` | **Secondary Accent / Tag**: Soft Dusty Blue |
| `--color-border` / `theme-border` | `#3F3F46` | **Borders / Dividers**: Dark Slate Gray |

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
