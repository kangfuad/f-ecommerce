<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
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

const { loadCart } = useCart()
const { initTheme } = useTheme()

const selectedProductForModal = shallowRef<Product | null>(null)

function openProductModal(product: Product) {
  selectedProductForModal.value = product
}

function closeProductModal() {
  selectedProductForModal.value = null
}

function scrollToCatalog() {
  const el = document.getElementById('katalog')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
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
      @search="setSearch"
      @select-category="(cat) => setCategory(cat as ProductCategory)"
    />

    <!-- Main Content -->
    <main class="flex-1">
      <!-- 1. Hero Section -->
      <HeroBanner @explore="scrollToCatalog" />

      <!-- 2. Value Proposition -->
      <ValueProps />

      <!-- 3. Category Grid -->
      <CategoryGrid
        :selected-category="selectedCategory"
        @select-category="setCategory"
      />

      <!-- 4. Product Catalog Section -->
      <section id="katalog" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <!-- Section Header & Filter Controls -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span class="text-xs uppercase font-extrabold tracking-widest text-sage dark:text-sage-soft">Katalog Perlengkapan</span>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-theme-primary mt-1">
              Pilihan Unit Sewa Siap Pakai
            </h2>
            <p class="text-xs text-theme-muted mt-1">
              Menampilkan {{ products.length }} unit premium dengan kondisi terawat, QC ketat, dan garansi fungsi.
            </p>
          </div>

          <!-- Sorting & Filter options -->
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-theme-muted whitespace-nowrap">Urutkan:</label>
            <select
              :value="sortBy"
              @change="(e) => setSort((e.target as HTMLSelectElement).value as any)"
              class="bg-theme-card border border-theme-border text-theme-primary text-xs font-bold rounded-full px-4 py-2.5 focus:outline-none focus:border-sage dark:focus:border-sage-soft cursor-pointer shadow-sm"
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
          <span class="text-xs text-theme-muted font-medium">Filter Aktif:</span>
          <span
            v-if="selectedCategory !== 'ALL'"
            class="inline-flex items-center gap-1 text-xs font-bold bg-sage/15 dark:bg-zinc-800 text-sage-hover dark:text-sage-soft border border-sage/30 dark:border-theme-border px-3 py-1 rounded-full"
          >
            Kategori: {{ selectedCategory }}
            <button @click="setCategory(ProductCategory.ALL)" class="hover:text-theme-primary ml-1 font-bold">×</button>
          </span>
          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-1 text-xs font-bold bg-slate-200 dark:bg-zinc-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
          >
            Cari: "{{ searchQuery }}"
            <button @click="setSearch('')" class="hover:text-theme-primary ml-1 font-bold">×</button>
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-24">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sage dark:border-sage-soft border-t-transparent"></div>
          <p class="text-xs text-theme-muted font-semibold mt-3">Memuat unit sewa...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="text-center py-20 bg-theme-card rounded-3xl border border-theme-border p-8">
          <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-900 border border-theme-border flex items-center justify-center mx-auto text-theme-muted mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="font-bold text-base text-theme-primary">Unit Tidak Ditemukan</h3>
          <p class="text-xs text-theme-muted mt-1 max-w-sm mx-auto">
            Maaf, tidak ada unit yang sesuai dengan kata kunci pencarian atau kategori yang dipilih.
          </p>
          <button
            @click="() => { setCategory(ProductCategory.ALL); setSearch(''); }"
            class="mt-4 text-xs font-bold text-sage dark:text-sage-soft hover:underline cursor-pointer"
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
            @quick-rent="openProductModal"
          />
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

    <!-- Cart Drawer -->
    <CartDrawer />
  </div>
</template>
