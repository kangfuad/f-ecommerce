# Design System & Theme Guidelines: e-punyasewa (Muted Sky & Sage Theme)

Standar sistem warna, token CSS variables, tipografi, dan implementasi komponen UI untuk platform **e-punyasewa** yang mendukung **Light Mode** dan **Dark Mode** secara dinamis dan memenuhi standar aksesibilitas WCAG AA.

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
