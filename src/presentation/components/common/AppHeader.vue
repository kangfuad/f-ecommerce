<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '@/presentation/composables/useCart'
import { useWishlist } from '@/presentation/composables/useWishlist'
import { useTheme } from '@/presentation/composables/useTheme'
import { ProductCategory } from '@/domain/enums/ProductCategory'

interface Props {
  selectedCategory?: ProductCategory
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: ProductCategory.ALL,
})

const { totalItemCount, openCart } = useCart()
const { wishlistIds } = useWishlist()
const { currentTheme, currentPreference, toggleTheme } = useTheme()

const mobileMenuOpen = ref(false)
const searchQuery = ref('')

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'select-category', category: ProductCategory): void
}>()

function handleSearch() {
  emit('search', searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
  emit('search', '')
}

function handleCategoryClick(cat: ProductCategory) {
  emit('select-category', cat)
  mobileMenuOpen.value = false
}

const navItems = [
  { id: ProductCategory.ALL, label: 'Semua Produk' },
  { id: ProductCategory.CAMERA, label: 'Kamera & Lensa' },
  { id: ProductCategory.DRONE_AUDIO, label: 'Drone & Audio' },
  { id: ProductCategory.OUTDOOR, label: 'Outdoor & Camping' },
  { id: ProductCategory.GADGET, label: 'Gadget & Laptop' },
  { id: ProductCategory.FASHION_EVENT, label: 'Fashion & Acara' },
]
</script>

<template>
  <div class="sticky top-0 z-40 w-full">
    <!-- Top Announcement Bar -->
    <div class="bg-[#0F172A] dark:bg-[#121212] text-slate-300 dark:text-ash-gray text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-slate-800 dark:border-[#262626]">
      <span class="inline-block w-2 h-2 rounded-full bg-sage dark:bg-sage-soft animate-pulse"></span>
      <span class="truncate">Jaminan Unit Bersih & Terawat 100% • Bebas Deposit Member Terverifikasi • CS 24/7</span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="glass-header border-b border-theme-border transition-all duration-300">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-20 flex items-center justify-between gap-3 xl:gap-6">
        
        <!-- Left: Logo -->
        <a href="#" class="flex items-center gap-2.5 shrink-0 group py-1">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sage to-emerald-400 dark:from-zinc-800 dark:to-zinc-700 dark:border dark:border-zinc-600 flex items-center justify-center text-white dark:text-sage-soft shadow-md group-hover:scale-105 transition-all shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="flex flex-col justify-center">
            <div class="font-extrabold text-xl tracking-tight text-theme-primary whitespace-nowrap leading-none">
              <span>e-punya</span><span class="text-sage dark:text-sage-soft">sewa</span>
            </div>
            <span class="text-[9px] font-bold tracking-widest text-theme-muted mt-1 uppercase whitespace-nowrap leading-none">
              Rental Platform
            </span>
          </div>
        </a>

        <!-- Center: Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="handleCategoryClick(item.id)"
            :class="[
              'px-3.5 py-2 text-xs xl:text-sm font-bold rounded-full transition-all whitespace-nowrap cursor-pointer',
              selectedCategory === item.id
                ? 'bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft border border-sage/30 dark:border-theme-border shadow-sm'
                : 'text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            ]"
          >
            {{ item.label }}
          </button>
        </nav>

        <!-- Right: Search, Theme Toggle & Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Search input box -->
          <div class="relative hidden sm:block w-36 md:w-44 lg:w-44 xl:w-52 2xl:w-60">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Cari kamera, tenda..."
              class="w-full bg-slate-100/90 dark:bg-zinc-900/90 border border-theme-border rounded-full pl-9 pr-7 py-2 text-xs text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-sage dark:focus:border-sage-soft transition-all"
            />
            <svg class="absolute left-3 top-2.5 text-theme-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-2.5 top-2 text-theme-muted hover:text-theme-primary text-xs font-bold"
            >
              ×
            </button>
          </div>

          <!-- Theme Toggle Button (Light/Dark) -->
          <button
            @click="toggleTheme"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0 border border-theme-border"
            :title="currentPreference === 'system' ? 'Tema Sistem (' + currentTheme + '). Klik untuk ubah' : (currentTheme === 'dark' ? 'Mode Gelap Aktif. Klik untuk Mode Terang' : 'Mode Terang Aktif. Klik untuk Mode Gelap')"
            aria-label="Toggle Theme"
          >
            <!-- Sun icon for dark mode (click to light) -->
            <svg v-if="currentTheme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <!-- Moon icon for light mode (click to dark) -->
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>

          <!-- Wishlist button -->
          <button
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0 border border-theme-border"
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
            <span
              v-if="wishlistIds.length > 0"
              class="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
            >
              {{ wishlistIds.length }}
            </span>
          </button>

          <!-- Cart Button -->
          <button
            @click="openCart"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0 border border-theme-border"
            aria-label="Keranjang Sewa"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span
              v-if="totalItemCount > 0"
              class="absolute -top-0.5 -right-0.5 bg-sage dark:bg-sage-soft text-white dark:text-deep-charcoal text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-bounce"
            >
              {{ totalItemCount }}
            </span>
          </button>

          <!-- Sign In Button -->
          <button
            class="hidden md:inline-flex items-center gap-1.5 border border-theme-border rounded-full px-4 py-2 text-xs font-bold text-theme-primary hover:bg-sage hover:text-white dark:hover:bg-sage-soft dark:hover:text-deep-charcoal transition-all shrink-0 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Masuk</span>
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer border border-theme-border"
            aria-label="Menu"
          >
            <svg v-if="!mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Search & Drawer -->
      <div v-if="mobileMenuOpen" class="lg:hidden bg-theme-card border-t border-theme-border px-5 py-5 space-y-4 animate-fade-up shadow-2xl">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Cari barang sewa..."
            class="w-full bg-slate-100 dark:bg-zinc-900 border border-theme-border rounded-full pl-10 pr-8 py-2.5 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-sage dark:focus:border-sage-soft"
          />
          <svg class="absolute left-3.5 top-3 text-theme-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-2.5 text-theme-muted hover:text-theme-primary text-sm font-bold"
          >
            ×
          </button>
        </div>

        <div class="space-y-1 text-sm font-bold text-theme-muted">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="handleCategoryClick(item.id)"
            :class="[
              'w-full text-left py-2.5 px-3 rounded-xl transition-colors',
              selectedCategory === item.id ? 'bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft font-bold' : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            ]"
          >
            {{ item.label }}
          </button>
        </div>

        <button class="w-full py-3 rounded-full bg-theme-cta text-theme-cta-text font-extrabold text-sm shadow-md">
          Masuk / Daftar Akun
        </button>
      </div>
    </header>
  </div>
</template>
