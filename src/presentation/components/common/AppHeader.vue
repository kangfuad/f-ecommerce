<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const categoryDropdownRef = ref<HTMLElement | null>(null)
const categoryDropdownOpen = ref(false)
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
  categoryDropdownOpen.value = false
  mobileMenuOpen.value = false
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node)) {
    categoryDropdownOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})

const navItems = [
  { id: ProductCategory.ALL, label: 'Semua Produk', icon: '📦', desc: 'Lihat seluruh katalog siap sewa' },
  { id: ProductCategory.CAMERA, label: 'Kamera & Lensa', icon: '📷', desc: 'Sony, Canon, Lensa GM, Lighting' },
  { id: ProductCategory.DRONE_AUDIO, label: 'Drone & Audio', icon: '🚁', desc: 'DJI Mavic, Mic Wireless, Mixer' },
  { id: ProductCategory.OUTDOOR, label: 'Outdoor & Camping', icon: '🏕️', desc: 'Tenda Dome, Carrier, Cooking Set' },
  { id: ProductCategory.GADGET, label: 'Gadget & Laptop', icon: '💻', desc: 'MacBook Pro, iPad Pro, Flagship' },
  { id: ProductCategory.FASHION_EVENT, label: 'Fashion & Acara', icon: '👔', desc: 'Tuxedo, Gaun Pesta, Sound' },
]
</script>

<template>
  <div class="sticky top-0 z-40 w-full">
    <!-- Top Announcement Bar -->
    <div class="bg-[#0F172A] dark:bg-[#121212] text-slate-300 dark:text-ash-gray text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-slate-800 dark:border-[#262626]">
      <span class="inline-block w-2 h-2 rounded-full bg-sage dark:bg-sage-soft animate-pulse shrink-0"></span>
      <span class="truncate text-[11px] sm:text-xs">Jaminan Unit Bersih & Terawat 100% • Bebas Deposit Member Terverifikasi • CS 24/7</span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="glass-header border-b border-theme-border transition-all duration-300">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        <!-- Left: Logo & Grouped Menu Links -->
        <div class="flex items-center gap-4 sm:gap-6 shrink-0">
          <!-- Logo -->
          <a href="#" class="flex items-center gap-2.5 group py-1 shrink-0">
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
              <span class="text-[9px] font-bold tracking-widest text-theme-muted mt-1 uppercase whitespace-nowrap leading-none hidden sm:block">
                Rental Platform
              </span>
            </div>
          </a>

          <!-- Grouped Kategori Dropdown -->
          <div class="relative hidden md:block" ref="categoryDropdownRef">
            <button
              @click.stop="categoryDropdownOpen = !categoryDropdownOpen"
              :class="[
                'inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-full border transition-all cursor-pointer shadow-xs',
                categoryDropdownOpen || selectedCategory !== 'ALL'
                  ? 'bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft border-sage/40 dark:border-theme-border'
                  : 'bg-slate-100/80 dark:bg-zinc-800/80 text-theme-primary border-theme-border hover:bg-slate-200/80 dark:hover:bg-zinc-700/80'
              ]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Kategori</span>
              <span
                v-if="selectedCategory !== 'ALL'"
                class="text-[10px] bg-sage dark:bg-sage-soft text-white dark:text-deep-charcoal px-1.5 py-0.2 rounded-full font-bold"
              >
                1
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                :class="['transition-transform duration-200', categoryDropdownOpen && 'rotate-180']"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Dropdown Popover Menu -->
            <div
              v-if="categoryDropdownOpen"
              class="absolute left-0 top-full mt-2.5 w-80 bg-theme-card border border-theme-border rounded-3xl p-3 shadow-2xl z-50 animate-fade-up backdrop-blur-xl"
            >
              <div class="px-3 py-2 text-[11px] font-bold text-theme-muted uppercase tracking-wider border-b border-theme-border mb-2 flex items-center justify-between">
                <span>Katalog Kategori Sewa</span>
                <button
                  v-if="selectedCategory !== 'ALL'"
                  @click="handleCategoryClick(ProductCategory.ALL)"
                  class="text-sage dark:text-sage-soft hover:underline cursor-pointer lowercase text-[11px]"
                >
                  reset filter
                </button>
              </div>

              <div class="space-y-1">
                <button
                  v-for="item in navItems"
                  :key="item.id"
                  @click="handleCategoryClick(item.id)"
                  :class="[
                    'w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer group',
                    selectedCategory === item.id
                      ? 'bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft font-bold'
                      : 'text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-base p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform">{{ item.icon }}</span>
                    <div>
                      <p class="font-bold text-xs text-theme-primary">{{ item.label }}</p>
                      <p class="text-[10px] text-theme-muted font-normal">{{ item.desc }}</p>
                    </div>
                  </div>
                  <span v-if="selectedCategory === item.id" class="text-sage dark:text-sage-soft font-bold text-sm mr-1">✓</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Secondary Quick Links -->
          <nav class="hidden lg:flex items-center gap-1.5 text-xs md:text-sm font-semibold text-theme-muted">
            <button
              @click="scrollToSection('katalog')"
              class="px-3 py-2 rounded-full hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer whitespace-nowrap"
            >
              Semua Unit
            </button>
            <a
              href="#kategori"
              class="px-3 py-2 rounded-full hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors whitespace-nowrap"
            >
              Jaminan Sewa
            </a>
          </nav>
        </div>

        <!-- Center: Prominent, Flexible Search Bar -->
        <div class="flex-1 max-w-md mx-2 sm:mx-4 relative hidden sm:block">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Cari kamera, tenda, drone, perlengkapan..."
            class="w-full bg-slate-100/90 dark:bg-zinc-900/90 border border-theme-border rounded-full pl-9 pr-8 py-2.5 text-xs text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-sage dark:focus:border-sage-soft focus:bg-white dark:focus:bg-zinc-900 shadow-inner transition-all"
          />
          <svg class="absolute left-3 top-3 text-theme-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-2.5 text-theme-muted hover:text-theme-primary text-xs font-bold"
          >
            ×
          </button>
        </div>

        <!-- Right: Theme, Wishlist, Cart, Masuk -->
        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <!-- Theme Toggle Button (System / Light / Dark) -->
          <button
            @click="toggleTheme"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0 border border-theme-border"
            :title="currentPreference === 'system' ? 'Mode Sistem Auto (' + currentTheme + '). Klik untuk ganti ke Light' : (currentPreference === 'light' ? 'Mode Terang Manual. Klik untuk ganti ke Dark' : 'Mode Gelap Manual. Klik untuk ganti ke Auto Sistem')"
            aria-label="Toggle Theme"
          >
            <!-- System Monitor icon -->
            <svg v-if="currentPreference === 'system'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sage-hover dark:text-sage-soft">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <!-- Sun icon for light mode -->
            <svg v-else-if="currentPreference === 'light'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500">
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
            <!-- Moon icon for dark mode -->
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>

            <!-- Indicator dot for system mode -->
            <span
              v-if="currentPreference === 'system'"
              class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sage dark:bg-sage-soft border-2 border-theme-card"
            ></span>
          </button>

          <!-- Wishlist button -->
          <button
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0 border border-theme-border"
            aria-label="Wishlist"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
            <span
              v-if="wishlistIds.length > 0"
              class="absolute -top-0.5 -right-0.5 bg-coral text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span
              v-if="totalItemCount > 0"
              class="absolute -top-0.5 -right-0.5 bg-sage dark:bg-sage-soft text-white dark:text-deep-charcoal text-[9px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-bounce"
            >
              {{ totalItemCount }}
            </span>
          </button>

          <!-- Sign In Button -->
          <button
            class="hidden sm:inline-flex items-center gap-1.5 border border-theme-border rounded-full px-4 py-2 text-xs font-bold text-theme-primary hover:bg-sage hover:text-white dark:hover:bg-sage-soft dark:hover:text-deep-charcoal transition-all shrink-0 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Masuk</span>
          </button>

          <!-- Mobile Hamburger (Visible on small screens) -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer border border-theme-border"
            aria-label="Menu"
          >
            <svg v-if="!mobileMenuOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-theme-card border-t border-theme-border px-5 py-5 space-y-4 animate-fade-up shadow-2xl">
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
              'w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors text-left',
              selectedCategory === item.id ? 'bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft font-bold' : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
            <span v-if="selectedCategory === item.id" class="text-sage dark:text-sage-soft font-bold text-xs">✓</span>
          </button>
        </div>

        <button class="w-full py-3 rounded-full bg-theme-cta text-theme-cta-text font-extrabold text-sm shadow-md">
          Masuk / Daftar Akun
        </button>
      </div>
    </header>
  </div>
</template>
