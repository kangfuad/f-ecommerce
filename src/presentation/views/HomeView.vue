<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import { Product } from '@/domain/entities/Product'
import { ProductCategory } from '@/domain/enums/ProductCategory'
import { useProducts } from '@/presentation/composables/useProducts'
import { useCart } from '@/presentation/composables/useCart'
import { useTheme } from '@/presentation/composables/useTheme'
import AppHeader from '../components/common/AppHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
import HeroBanner from '../components/catalog/HeroBanner.vue'
import ValueProps from '../components/catalog/ValueProps.vue'
import CategoryGrid from '../components/catalog/CategoryGrid.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import ProductDetailModal from '../components/catalog/ProductDetailModal.vue'
import CartDrawer from '../components/cart/CartDrawer.vue'
import { IconArrowRight } from '@/presentation/components/icons'

const {
  products,
  isLoading,
  selectedCategory,
  searchQuery,
  sortBy,
  fetchProducts,
  setCategory,
  setSearch,
  setSort,
} = useProducts()

const { loadCart, quickAddToCart } = useCart()
const { initTheme } = useTheme()

const selectedProductForModal = shallowRef<Product | null>(null)

const topFeaturedProduct = computed(() => {
  if (!products.value || products.value.length === 0) return null
  return (
    products.value.find((p) => p.isPopular && p.isFeatured) ||
    products.value.find((p) => p.isPopular) ||
    products.value.find((p) => p.isFeatured) ||
    products.value[0] ||
    null
  )
})


function openProductModal(product: Product) {
  selectedProductForModal.value = product
}

function closeProductModal() {
  selectedProductForModal.value = null
}

async function handleQuickAddToCart(product: Product, startDate?: string, endDate?: string) {
  await quickAddToCart(product, startDate, endDate)
}

function scrollToCatalog() {
  const el = document.getElementById('katalog')
  if (el) {
    const headerOffset = 100
    const elementPosition = el.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

function handleSelectFeatured(productOrId: Product | string) {
  if (typeof productOrId === 'string') {
    const product = products.value.find((p) => p.id === productOrId)
    if (product) openProductModal(product)
  } else if (productOrId) {
    openProductModal(productOrId)
  }
}

onMounted(() => {
  initTheme()
  fetchProducts()
  loadCart()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <!-- Header -->
    <AppHeader
      :selected-category="selectedCategory"
      @select-category="(cat) => setCategory(cat as ProductCategory)"
    />

    <!-- Main Content -->
    <main class="flex-1">
      <!-- 1. Hero Section -->
      <HeroBanner
        :featured-product="topFeaturedProduct"
        @explore="scrollToCatalog"
        @select-featured="handleSelectFeatured"
      />

      <!-- 2. Value Proposition -->
      <ValueProps />

      <!-- 3. Category Grid -->
      <CategoryGrid
        :selected-category="selectedCategory"
        @select-category="setCategory"
      />

      <!-- 4. Product Catalog Showcase Section -->
      <section id="katalog" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24 md:scroll-mt-28">
        <!-- Section Header & Filter Controls -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span class="text-xs uppercase font-extrabold tracking-widest text-forest dark:text-forest-glow">Katalog Pilihan</span>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-theme-primary mt-1">
              Pilihan Unit Sewa Siap Pakai
            </h2>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 font-medium">
              Menampilkan {{ products.length }} unit premium dengan kondisi terawat, QC ketat, dan garansi fungsi.
            </p>
          </div>

          <!-- Sorting & Filter options -->
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-stone-500 whitespace-nowrap">Urutkan:</label>
            <select
              :value="sortBy"
              @change="(e) => setSort((e.target as HTMLSelectElement).value as any)"
              class="bg-theme-card border border-theme-border text-theme-primary text-xs font-bold rounded-full px-4 py-2.5 focus:outline-none focus:border-forest cursor-pointer shadow-sm"
            >
              <option value="popular">Paling Populer</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Tarif Terendah</option>
              <option value="price_desc">Tarif Tertinggi</option>
            </select>
          </div>
        </div>

        <!-- Active Filter Badge Indicator -->
        <div v-if="selectedCategory !== 'ALL' || searchQuery" class="flex items-center gap-2 mb-6">
          <span class="text-xs text-stone-500 font-medium">Filter Aktif:</span>
          <span
            v-if="selectedCategory !== 'ALL'"
            class="inline-flex items-center gap-1 text-xs font-bold bg-forest/15 dark:bg-stone-800 text-forest dark:text-forest-glow border border-forest/30 dark:border-theme-border px-3 py-1 rounded-full"
          >
            Kategori: {{ selectedCategory }}
            <button @click="setCategory(ProductCategory.ALL)" class="hover:text-theme-primary ml-1 font-bold">×</button>
          </span>
          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-1 text-xs font-bold bg-stone-200 dark:bg-stone-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
          >
            Cari: "{{ searchQuery }}"
            <button @click="setSearch('')" class="hover:text-theme-primary ml-1 font-bold">×</button>
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-24">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest dark:border-forest-glow border-t-transparent"></div>
          <p class="text-xs text-stone-500 font-semibold mt-3">Memuat unit sewa...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="text-center py-20 bg-theme-card rounded-3xl border border-theme-border p-8">
          <div class="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-900 border border-theme-border flex items-center justify-center mx-auto text-stone-400 mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="font-bold text-base text-theme-primary">Unit Tidak Ditemukan</h3>
          <p class="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Maaf, tidak ada unit yang sesuai dengan kata kunci pencarian atau kategori yang dipilih.
          </p>
          <button
            @click="() => { setCategory(ProductCategory.ALL); setSearch(''); }"
            class="mt-4 text-xs font-bold text-forest dark:text-forest-glow hover:underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>

        <!-- Product Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @select-product="openProductModal"
            @quick-add-to-cart="handleQuickAddToCart"
          />
        </div>

        <!-- Bottom Minimalist Contextual Explore Bar -->
        <div class="mt-14 p-6 sm:p-8 rounded-3xl bg-stone-50/90 dark:bg-stone-900/60 border border-theme-border flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
          <div class="text-center sm:text-left">
            <h3 class="font-display text-base sm:text-lg font-bold text-theme-primary">
              Mencari perlengkapan atau unit spesifik lainnya?
            </h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Jelajahi 48+ koleksi lengkap kamera cinema, drone DJI, tenda dome, dan gadget siap sewa.
            </p>
          </div>
          <router-link
            to="/katalog"
            class="inline-flex items-center gap-2 bg-forest hover:bg-forest-hover dark:bg-forest dark:hover:bg-forest-hover text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm hover:scale-103 active:scale-97 transition-all cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <span>Buka Seluruh Katalog</span>
            <IconArrowRight :size="14" class="group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Product Detail Modal -->
    <ProductDetailModal
      :product="selectedProductForModal"
      @close="closeProductModal"
    />
  </div>
</template>
