<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/presentation/composables/useCart'
import { useWishlist } from '@/presentation/composables/useWishlist'
import { useAuth } from '@/presentation/composables/useAuth'
import { ProductCategory } from '@/domain/enums/ProductCategory'
import {
  IconLogo,
  IconHeartWishlist,
  IconCartBag,
  IconUser,
  IconChevronDown,
  IconCheck,
  IconClose,
  IconMenu,
  IconShieldCheck,
  IconDeliveryTruck,
  IconCategoryAll,
  IconCategoryCamera,
  IconCategoryDrone,
  IconCategoryOutdoor,
  IconCategoryGadget,
  IconCategoryFashion,
} from '@/presentation/components/icons'

interface Props {
  selectedCategory?: ProductCategory
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: ProductCategory.ALL,
})

const router = useRouter()
const { totalItemCount, openCart, isCartBadgeBouncing } = useCart()
const { wishlistIds, openWishlist } = useWishlist()
const { currentUser, isLoggedIn, openLoginModal, openRegisterModal, logout, initAuth } = useAuth()

const categoryDropdownRef = ref<HTMLElement | null>(null)
const categoryDropdownOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const emit = defineEmits<{
  (e: 'select-category', category: ProductCategory): void
}>()

function handleCategoryClick(cat: ProductCategory) {
  emit('select-category', cat)
  categoryDropdownOpen.value = false
  mobileMenuOpen.value = false
  router.push({
    path: '/katalog',
    query: cat !== ProductCategory.ALL ? { category: cat } : {},
  }).catch(() => {})
}

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node)) {
    categoryDropdownOpen.value = false
  }
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

import { CategoryService, type CategoryDto } from '@/infrastructure/services/api'

const iconMap: Record<string, any> = {
  IconCategoryAll,
  IconCategoryCamera,
  IconCategoryDrone,
  IconCategoryOutdoor,
  IconCategoryGadget,
  IconCategoryFashion,
}

const navCategories = ref<{ id: ProductCategory; label: string; icon: any; desc: string }[]>([
  { id: ProductCategory.ALL, label: 'Semua Kategori', icon: IconCategoryAll, desc: 'Lihat seluruh katalog peralatan' },
  { id: ProductCategory.CAMERA, label: 'Kamera & Lensa', icon: IconCategoryCamera, desc: 'Mirrorless, Cinema & Lensa Pro' },
  { id: ProductCategory.DRONE_AUDIO, label: 'Drone & Audio', icon: IconCategoryDrone, desc: 'DJI Mavic, Mic Wireless & Sound' },
  { id: ProductCategory.OUTDOOR, label: 'Outdoor & Camping', icon: IconCategoryOutdoor, desc: 'Tenda, Carrier & Perlengkapan' },
  { id: ProductCategory.GADGET, label: 'Gadget & Laptop', icon: IconCategoryGadget, desc: 'MacBook Pro, iPad & Tablet' },
  { id: ProductCategory.FASHION_EVENT, label: 'Fashion & Acara', icon: IconCategoryFashion, desc: 'Lighting, Speaker & Wardrobe' },
])

async function loadNavCategories() {
  try {
    const res = await CategoryService.getCategories()
    if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
      navCategories.value = res.data.map((cat: CategoryDto) => ({
        id: (cat.id === 'GADGET_OFFICE' ? ProductCategory.GADGET : cat.id) as ProductCategory,
        label: cat.label,
        icon: iconMap[cat.icon] || IconCategoryAll,
        desc: cat.description || '',
      }))
    }
  } catch (e) {
    console.warn('Failed to load categories from API:', e)
  }
}

onMounted(() => {
  initAuth()
  loadNavCategories()
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="sticky top-0 z-40 w-full">
    <!-- Top Announcement Bar -->
    <div class="bg-[#1C1917] dark:bg-[#141211] text-stone-300 dark:text-stone-300 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2.5 border-b border-stone-800 dark:border-stone-900">
      <span class="relative flex h-2 w-2 shrink-0">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span class="hidden sm:inline">Platform Reservasi & Informasi Sewa Perlengkapan Modern</span>
      <strong class="font-extrabold text-white">• Transaksi Langsung & Transparan</strong>
    </div>

    <!-- Main Navigation Bar -->
    <header class="bg-theme-nav border-b border-theme-border backdrop-blur-md transition-colors duration-300">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        <!-- Left: Logo & Category Dropdown & Nav Links -->
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Brand Logo -->
          <router-link
            to="/"
            class="flex items-center gap-3 group shrink-0 focus:outline-none"
            aria-label="e-punyasewa Home"
          >
            <div class="w-10 h-10 rounded-xl bg-[#244E33] dark:bg-stone-800 border border-emerald-600/40 dark:border-stone-700 flex items-center justify-center text-white dark:text-emerald-400 shadow-md group-hover:scale-105 transition-all shrink-0">
              <IconLogo :size="22" />
            </div>
            <div class="flex flex-col justify-center">
              <div class="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white whitespace-nowrap leading-none">
                <span>e-punya</span><span class="text-[#244E33] dark:text-emerald-400">sewa</span>
              </div>
              <span class="text-[9px] font-bold tracking-widest text-stone-500 dark:text-stone-400 mt-1 uppercase whitespace-nowrap leading-none hidden sm:block">
                Rental Platform
              </span>
            </div>
          </router-link>

          <!-- Grouped Kategori Dropdown -->
          <div class="relative hidden md:block" ref="categoryDropdownRef">
            <button
              @click.stop="categoryDropdownOpen = !categoryDropdownOpen"
              :class="[
                'inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-full border transition-all cursor-pointer shadow-xs',
                categoryDropdownOpen || selectedCategory !== ProductCategory.ALL
                  ? 'bg-forest/15 dark:bg-stone-800 text-forest dark:text-forest-glow border-forest/40 dark:border-theme-border'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 text-theme-primary border-theme-border hover:bg-stone-200/80 dark:hover:bg-stone-700/80'
              ]"
            >
              <IconCategoryAll :size="15" />
              <span>Kategori</span>
              <span
                v-if="selectedCategory !== ProductCategory.ALL"
                class="text-[10px] bg-forest text-white px-1.5 py-0.2 rounded-full font-bold"
              >
                1
              </span>
              <IconChevronDown
                :size="13"
                :class="['transition-transform duration-200 text-stone-500', categoryDropdownOpen && 'rotate-180']"
              />
            </button>

            <!-- Dropdown Panel -->
            <div
              v-if="categoryDropdownOpen"
              class="absolute left-0 top-full mt-2.5 w-80 bg-theme-card border border-theme-border rounded-3xl p-3 shadow-2xl z-50 animate-fade-up backdrop-blur-xl"
            >
              <div class="px-3 py-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-theme-border mb-2 flex items-center justify-between">
                <span>Katalog Kategori Sewa</span>
                <button
                  v-if="selectedCategory !== ProductCategory.ALL"
                  @click="handleCategoryClick(ProductCategory.ALL)"
                  class="text-forest dark:text-forest-glow hover:underline cursor-pointer lowercase text-[11px]"
                >
                  reset filter
                </button>
              </div>

              <div class="space-y-1">
                <button
                  v-for="item in navCategories"
                  :key="item.id"
                  @click="handleCategoryClick(item.id)"
                  :class="[
                    'w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer group',
                    selectedCategory === item.id
                      ? 'bg-forest/15 dark:bg-stone-800 text-forest dark:text-forest-glow font-bold'
                      : 'text-theme-primary hover:bg-stone-100 dark:hover:bg-stone-800/70'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <span class="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-forest dark:text-forest-glow group-hover:bg-theme-cta group-hover:text-theme-cta-text transition-all">
                      <component :is="item.icon" :size="18" />
                    </span>
                    <div>
                      <p class="font-bold text-theme-primary group-hover:text-forest dark:group-hover:text-forest-glow transition-colors">
                        {{ item.label }}
                      </p>
                      <p class="text-[10px] text-stone-500 font-normal">
                        {{ item.desc }}
                      </p>
                    </div>
                  </div>
                  <IconCheck
                    v-if="selectedCategory === item.id"
                    :size="16"
                    class="text-forest dark:text-forest-glow shrink-0 ml-2"
                  />
                </button>
              </div>

              <div class="pt-2 mt-2 border-t border-theme-border">
                <router-link
                  to="/katalog"
                  @click="categoryDropdownOpen = false"
                  class="w-full block py-2 text-center text-xs font-bold text-forest dark:text-forest-glow hover:underline"
                >
                  Buka Halaman Katalog Lengkap →
                </router-link>
              </div>
            </div>
          </div>

          <!-- Direct Link to /katalog & /bantuan -->
          <router-link
            to="/katalog"
            class="hidden md:inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 dark:text-stone-300 hover:text-forest dark:hover:text-forest-glow transition py-2 px-3.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span>Semua Unit</span>
          </router-link>

          <router-link
            to="/bantuan"
            class="hidden lg:inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 dark:text-stone-300 hover:text-forest dark:hover:text-forest-glow transition py-2 px-3.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span>Bantuan & FAQ</span>
          </router-link>
        </div>

        <!-- Right: Action Controls (Wishlist, Cart, User Auth Profile, Mobile Menu) -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          <!-- Wishlist Badge Trigger (Opens Wishlist Drawer) -->
          <button
            @click="openWishlist"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-theme-border flex items-center justify-center text-theme-primary hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
            title="Buka Daftar Barang Favorit"
            aria-label="Wishlist Favorit"
          >
            <IconHeartWishlist :size="17" class="text-theme-primary" />
            <span
              v-if="wishlistIds.length > 0"
              class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
            >
              {{ wishlistIds.length }}
            </span>
          </button>

          <!-- Cart Slide-over Trigger Button (Neutral when 0, Active/Badge when > 0) -->
          <button
            @click="openCart"
            :class="[
              'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer group',
              totalItemCount > 0
                ? 'bg-forest/15 dark:bg-stone-800 text-forest dark:text-forest-glow border-forest/30 dark:border-forest/40 hover:bg-forest/20'
                : 'bg-stone-100 dark:bg-stone-800 border-theme-border text-theme-primary hover:bg-stone-200 dark:hover:bg-stone-700',
              isCartBadgeBouncing ? 'scale-115 ring-4 ring-forest/40' : ''
            ]"
            title="Buka Keranjang Sewa"
            aria-label="Keranjang Sewa"
          >
            <IconCartBag
              :size="17"
              :class="['transition-transform duration-300', isCartBadgeBouncing ? 'scale-125 text-emerald-500 animate-bounce' : 'group-hover:scale-110']"
            />
            <span
              v-if="totalItemCount > 0"
              :class="[
                'absolute -top-1 -right-1 bg-forest dark:bg-emerald-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-all duration-300',
                isCartBadgeBouncing ? 'scale-125' : ''
              ]"
            >
              {{ totalItemCount }}
            </span>
          </button>

          <!-- User Authentication Profile & Menu -->
          <!-- State A: Logged In Member Profile -->
          <div v-if="isLoggedIn && currentUser" class="relative hidden sm:block" ref="userMenuRef">
            <button
              @click.stop="userMenuOpen = !userMenuOpen"
              class="inline-flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-theme-border py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer"
            >
              <span class="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-[10px] font-black">
                {{ currentUser.initials }}
              </span>
              <span class="text-theme-primary truncate max-w-[90px]">{{ currentUser.fullName }}</span>
              <span class="hidden md:inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-black border border-emerald-500/30">
                <IconCheck :size="9" class="stroke-[3]" />
                <span>Verified</span>
              </span>
              <IconChevronDown :size="12" :class="['transition-transform duration-200', userMenuOpen && 'rotate-180']" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-full mt-2 w-64 bg-theme-card border border-theme-border rounded-2xl p-2.5 shadow-2xl z-50 animate-fade-up text-xs"
            >
              <div class="px-3 py-2 border-b border-theme-border mb-1.5">
                <p class="font-bold text-theme-primary truncate">{{ currentUser.fullName }}</p>
                <p class="text-[10px] text-stone-500 truncate">{{ currentUser.email }}</p>
                <div class="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-forest dark:text-forest-glow bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                  <IconShieldCheck :size="12" />
                  <span>Akun Terverifikasi</span>
                </div>
              </div>

              <div class="py-1 space-y-1">
                <router-link
                  to="/profil"
                  @click="userMenuOpen = false"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <IconUser :size="14" class="text-forest dark:text-forest-glow" />
                    <span>Profil Pengguna</span>
                  </div>
                  <span class="text-xs text-stone-400">→</span>
                </router-link>

                <router-link
                  to="/pesanan-saya"
                  @click="userMenuOpen = false"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <IconDeliveryTruck :size="14" class="text-forest dark:text-forest-glow" />
                    <span>Booking & Pesanan Saya</span>
                  </div>
                  <span class="text-xs text-stone-400">→</span>
                </router-link>

                <router-link
                  v-if="currentUser?.hasProviderStore"
                  to="/timeline-penyedia"
                  @click="userMenuOpen = false"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <IconCalendarDate :size="14" class="text-emerald-600 dark:text-emerald-400" />
                    <span>Panel Penyedia Sewa</span>
                  </div>
                  <span class="text-xs text-emerald-600 font-bold">Aktif</span>
                </router-link>

                <router-link
                  to="/bantuan"
                  @click="userMenuOpen = false"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <IconShieldCheck :size="14" class="text-forest dark:text-forest-glow" />
                    <span>Pusat Bantuan & FAQ</span>
                  </div>
                  <span class="text-xs text-stone-400">→</span>
                </router-link>

                <button
                  @click="() => { logout(); userMenuOpen = false; }"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer border-t border-theme-border/60 mt-1 pt-2"
                >
                  <span>Keluar Akun (Logout)</span>
                  <span class="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>

          <!-- State B: Guest (Login / Register Button) -->
          <div v-else class="hidden sm:inline-flex items-center gap-1">
            <button
              @click="openLoginModal"
              class="inline-flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-theme-primary font-bold text-xs px-3.5 py-2 rounded-full border border-theme-border transition cursor-pointer"
            >
              <IconUser :size="14" />
              <span>Masuk</span>
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-theme-border flex items-center justify-center text-theme-primary"
            aria-label="Menu Navigasi"
          >
            <IconClose v-if="mobileMenuOpen" :size="18" />
            <IconMenu v-else :size="18" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-theme-border bg-theme-card px-4 py-5 space-y-4 animate-fade-up shadow-xl"
      >
        <!-- Mobile Auth State -->
        <div v-if="isLoggedIn && currentUser" class="space-y-2">
          <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-theme-border flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-black">
                {{ currentUser.initials }}
              </span>
              <div>
                <p class="font-bold text-xs text-theme-primary">{{ currentUser.fullName }}</p>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <IconCheck :size="10" class="stroke-[3]" />
                  <span>Bebas Deposit Member</span>
                </span>
              </div>
            </div>
            <button @click="logout" class="text-xs font-bold text-red-500 hover:underline cursor-pointer">Keluar</button>
          </div>

          <router-link
            to="/profil"
            @click="mobileMenuOpen = false"
            class="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-theme-primary"
          >
            <div class="flex items-center gap-2">
              <IconUser :size="16" />
              <span>Profil Pengguna</span>
            </div>
            <span>→</span>
          </router-link>

          <router-link
            to="/pesanan-saya"
            @click="mobileMenuOpen = false"
            class="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-theme-primary"
          >
            <div class="flex items-center gap-2">
              <IconDeliveryTruck :size="16" />
              <span>Booking & Pesanan Saya</span>
            </div>
            <span>→</span>
          </router-link>

          <router-link
            v-if="currentUser?.hasProviderStore"
            to="/timeline-penyedia"
            @click="mobileMenuOpen = false"
            class="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            <div class="flex items-center gap-2">
              <IconCalendarDate :size="16" class="text-emerald-600 dark:text-emerald-400" />
              <span>Panel Penyedia Sewa</span>
            </div>
            <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20">Penyedia</span>
          </router-link>

          <router-link
            to="/bantuan"
            @click="mobileMenuOpen = false"
            class="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-theme-primary"
          >
            <div class="flex items-center gap-2">
              <IconShieldCheck :size="16" />
              <span>Pusat Bantuan & FAQ</span>
            </div>
            <span>→</span>
          </router-link>
        </div>
        <div v-else class="flex gap-2">
          <button
            @click="() => { openLoginModal(); mobileMenuOpen = false; }"
            class="flex-1 py-2 rounded-full border border-theme-border text-xs font-bold bg-stone-100 dark:bg-stone-800 text-center"
          >
            Masuk Akun
          </button>
          <button
            @click="() => { openRegisterModal(); mobileMenuOpen = false; }"
            class="flex-1 py-2 rounded-full bg-forest text-white text-xs font-black text-center"
          >
            Daftar Member
          </button>
        </div>

        <div class="flex items-center justify-between pt-2">
          <p class="text-xs font-extrabold uppercase tracking-wider text-stone-500">Pilih Kategori Sewa</p>
          <router-link
            to="/katalog"
            @click="mobileMenuOpen = false"
            class="text-xs font-bold text-forest dark:text-forest-glow"
          >
            Semua Unit →
          </router-link>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="cat in navCategories"
            :key="cat.id"
            @click="handleCategoryClick(cat.id)"
            :class="[
              'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer',
              selectedCategory === cat.id
                ? 'bg-forest/15 text-forest border-forest/40'
                : 'border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            <component :is="cat.icon" :size="16" class="shrink-0" />
            <span class="truncate">{{ cat.label }}</span>
          </button>
        </div>
      </div>
    </header>
  </div>
</template>
