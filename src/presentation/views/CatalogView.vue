<script setup lang="ts">
import { ref, computed, onMounted, watch, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductCategory, ProductCategoryLabel } from '@/domain/enums/ProductCategory'
import { ItemCondition } from '@/domain/enums/ItemCondition'
import { Product } from '@/domain/entities/Product'
import { useProducts } from '@/presentation/composables/useProducts'
import { useCart } from '@/presentation/composables/useCart'
import { useTheme } from '@/presentation/composables/useTheme'
import AppHeader from '../components/common/AppHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import ProductListRow from '../components/catalog/ProductListRow.vue'
import ProductDetailModal from '../components/catalog/ProductDetailModal.vue'
import CartDrawer from '../components/cart/CartDrawer.vue'
import BaseButton from '../components/common/BaseButton.vue'
import {
  IconFilter,
  IconGrid,
  IconList,
  IconSearch,
  IconClose,
  IconStar,
  IconCheck,
  IconSliders,
} from '@/presentation/components/icons'

const route = useRoute()
const router = useRouter()

const {
  products: allProducts,
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

// Local Filter States
const viewMode = ref<'grid' | 'list'>('grid')
const mobileFilterOpen = ref(false)
const selectedPriceRange = ref<string>('ALL') // 'ALL' | 'UNDER_150' | '150_500' | 'ABOVE_500'
const selectedLocations = ref<string[]>([])
const selectedConditions = ref<ItemCondition[]>([])
const minRating = ref<number>(0)

// Modal State
const selectedProductForModal = shallowRef<Product | null>(null)

function openProductModal(product: Product) {
  selectedProductForModal.value = product
}

function closeProductModal() {
  selectedProductForModal.value = null
}

async function handleQuickAddToCart(product: Product) {
  await quickAddToCart(product)
}

// Available filter options
const categoryOptions = [
  { value: ProductCategory.ALL, label: 'Semua Kategori' },
  { value: ProductCategory.CAMERA, label: 'Kamera & Lensa' },
  { value: ProductCategory.DRONE_AUDIO, label: 'Drone & Audio' },
  { value: ProductCategory.OUTDOOR, label: 'Outdoor & Camping' },
  { value: ProductCategory.GADGET, label: 'Gadget & Laptop' },
  { value: ProductCategory.FASHION_EVENT, label: 'Fashion & Acara' },
]

const priceRangeOptions = [
  { id: 'ALL', label: 'Semua Tarif', min: 0, max: Infinity },
  { id: 'UNDER_150', label: 'Dibawah Rp 150rb / hari', min: 0, max: 150000 },
  { id: '150_500', label: 'Rp 150rb - Rp 500rb / hari', min: 150000, max: 500000 },
  { id: 'ABOVE_500', label: 'Diatas Rp 500rb / hari', min: 500000, max: Infinity },
]

const availableLocations = [
  'Jakarta Selatan & BSD',
  'Jakarta Pusat',
  'Jakarta Barat',
  'Bandung & Sekitarnya',
]

// Filtered and sorted products
const filteredProducts = computed(() => {
  return allProducts.value.filter((product) => {
    // 1. Price Range filter
    if (selectedPriceRange.value !== 'ALL') {
      const range = priceRangeOptions.find((p) => p.id === selectedPriceRange.value)
      if (range) {
        const rate = product.dailyRate.amount
        if (rate < range.min || rate > range.max) return false
      }
    }

    // 2. Location filter
    if (selectedLocations.value.length > 0) {
      const matchesLocation = selectedLocations.value.some((loc) =>
        product.location.toLowerCase().includes(loc.toLowerCase())
      )
      if (!matchesLocation) return false
    }

    // 3. Condition filter
    if (selectedConditions.value.length > 0) {
      if (!selectedConditions.value.includes(product.condition)) return false
    }

    // 4. Rating filter
    if (minRating.value > 0) {
      if (product.rating < minRating.value) return false
    }

    return true
  })
})

// Count by category
function getCategoryCount(cat: ProductCategory): number {
  if (cat === ProductCategory.ALL) return allProducts.value.length
  return allProducts.value.filter((p) => p.category === cat).length
}

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== ProductCategory.ALL) count++
  if (searchQuery.value) count++
  if (selectedPriceRange.value !== 'ALL') count++
  if (selectedLocations.value.length > 0) count += selectedLocations.value.length
  if (selectedConditions.value.length > 0) count += selectedConditions.value.length
  if (minRating.value > 0) count++
  return count
})

function resetAllFilters() {
  setCategory(ProductCategory.ALL)
  setSearch('')
  selectedPriceRange.value = 'ALL'
  selectedLocations.value = []
  selectedConditions.value = []
  minRating.value = 0
  syncFiltersToUrl()
}

function toggleLocation(loc: string) {
  const idx = selectedLocations.value.indexOf(loc)
  if (idx > -1) {
    selectedLocations.value.splice(idx, 1)
  } else {
    selectedLocations.value.push(loc)
  }
  syncFiltersToUrl()
}

function toggleCondition(cond: ItemCondition) {
  const idx = selectedConditions.value.indexOf(cond)
  if (idx > -1) {
    selectedConditions.value.splice(idx, 1)
  } else {
    selectedConditions.value.push(cond)
  }
  syncFiltersToUrl()
}

// URL Query Synchronization
function syncFiltersToUrl() {
  const query: Record<string, string | undefined> = {}

  if (selectedCategory.value !== ProductCategory.ALL) {
    query.category = selectedCategory.value
  }
  if (searchQuery.value) {
    query.q = searchQuery.value
  }
  if (sortBy.value !== 'popular') {
    query.sort = sortBy.value
  }
  if (selectedPriceRange.value !== 'ALL') {
    query.price = selectedPriceRange.value
  }
  if (selectedLocations.value.length > 0) {
    query.locations = selectedLocations.value.join(',')
  }
  if (selectedConditions.value.length > 0) {
    query.conditions = selectedConditions.value.join(',')
  }
  if (minRating.value > 0) {
    query.rating = minRating.value.toString()
  }

  router.replace({ query }).catch(() => {})
}

function parseUrlQuery() {
  const q = route.query

  // 1. Whitelist Category Validation
  if (q.category && typeof q.category === 'string') {
    const validCategories = Object.values(ProductCategory)
    if (validCategories.includes(q.category as ProductCategory)) {
      setCategory(q.category as ProductCategory)
    }
  }

  // 2. Sanitize Search Input (Max length guard against ReDoS)
  if (q.q && typeof q.q === 'string') {
    setSearch(q.q.trim().slice(0, 80))
  }

  // 3. Whitelist Sort Option
  if (q.sort && typeof q.sort === 'string') {
    const validSorts = ['popular', 'rating', 'price_asc', 'price_desc']
    if (validSorts.includes(q.sort)) {
      setSort(q.sort as any)
    }
  }

  // 4. Whitelist Price Range Preset
  if (q.price && typeof q.price === 'string') {
    const validPrices = ['ALL', 'UNDER_150', '150_500', 'ABOVE_500']
    if (validPrices.includes(q.price)) {
      selectedPriceRange.value = q.price
    }
  }

  // 5. Whitelist Locations
  if (q.locations && typeof q.locations === 'string') {
    const parsedLocations = q.locations
      .split(',')
      .map((l) => l.trim())
      .filter((l) => availableLocations.includes(l))
    selectedLocations.value = parsedLocations
  }

  // 6. Whitelist Condition Enums
  if (q.conditions && typeof q.conditions === 'string') {
    const validConditions = Object.values(ItemCondition)
    const parsedConditions = q.conditions
      .split(',')
      .map((c) => c.trim())
      .filter((c) => validConditions.includes(c as ItemCondition)) as ItemCondition[]
    selectedConditions.value = parsedConditions
  }

  // 7. Numeric Rating Validation
  if (q.rating && typeof q.rating === 'string') {
    const r = parseFloat(q.rating)
    if (!isNaN(r) && r >= 0 && r <= 5) {
      minRating.value = r
    }
  }
}

watch(
  () => [
    selectedCategory.value,
    searchQuery.value,
    sortBy.value,
    selectedPriceRange.value,
    selectedLocations.value,
    selectedConditions.value,
    minRating.value,
  ],
  () => {
    syncFiltersToUrl()
  },
  { deep: true }
)

onMounted(() => {
  initTheme()
  parseUrlQuery()
  fetchProducts()
  loadCart()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <!-- Global Header -->
    <AppHeader
      :selected-category="selectedCategory"
      @search="setSearch"
      @select-category="setCategory"
    />

    <!-- Main Catalog Container -->
    <main class="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-stone-500 mb-4" aria-label="Breadcrumb">
        <router-link to="/" class="hover:text-forest dark:hover:text-forest-glow transition">Beranda</router-link>
        <span>/</span>
        <span class="text-theme-primary font-bold">Katalog Unit Sewa</span>
        <span v-if="selectedCategory !== ProductCategory.ALL">/</span>
        <span v-if="selectedCategory !== ProductCategory.ALL" class="text-forest dark:text-forest-glow font-bold">
          {{ ProductCategoryLabel[selectedCategory] }}
        </span>
      </nav>

      <!-- Page Banner / Heading -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-theme-border">
        <div>
          <span class="text-xs uppercase font-black tracking-widest text-forest dark:text-forest-glow">
            Eksplorasi Katalog
          </span>
          <h1 class="font-display text-2xl sm:text-4xl font-extrabold text-theme-primary mt-1">
            Katalog Unit & Perlengkapan Sewa
          </h1>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            Pilihan unit terawat, QC ketat, dan jaminan pengembalian deposit amanah.
          </p>
        </div>

        <!-- Quick Info Pills -->
        <div class="flex items-center gap-3 text-xs font-bold text-stone-600 dark:text-stone-300">
          <span class="px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            {{ filteredProducts.length }} Unit Tersedia
          </span>
        </div>
      </div>

      <!-- Controls & Active Filters Bar -->
      <div class="bg-theme-card rounded-2xl border border-theme-border p-3 sm:p-4 mb-6 shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <IconSearch :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            :value="searchQuery"
            @input="(e) => setSearch((e.target as HTMLInputElement).value)"
            type="text"
            placeholder="Cari kamera, drone, tenda, macbook..."
            class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-full pl-9 pr-8 py-2 text-xs sm:text-sm text-theme-primary placeholder:text-stone-400 focus:outline-none focus:border-forest"
          />
          <button
            v-if="searchQuery"
            @click="setSearch('')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-theme-primary"
          >
            <IconClose :size="14" />
          </button>
        </div>

        <!-- Right Controls: Mobile Filter Toggle, Sort, View Mode -->
        <div class="flex items-center justify-between lg:justify-end gap-3">
          <!-- Mobile Filter Button -->
          <button
            @click="mobileFilterOpen = true"
            class="lg:hidden inline-flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 border border-theme-border text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer transition"
          >
            <IconFilter :size="14" />
            <span>Filter</span>
            <span v-if="activeFiltersCount > 0" class="w-5 h-5 rounded-full bg-forest text-white text-[10px] flex items-center justify-center font-black">
              {{ activeFiltersCount }}
            </span>
          </button>

          <!-- Sorting Dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-stone-500 font-medium hidden sm:inline">Urutkan:</span>
            <select
              :value="sortBy"
              @change="(e) => setSort((e.target as HTMLSelectElement).value as any)"
              class="bg-stone-50 dark:bg-stone-900 border border-theme-border text-theme-primary text-xs font-bold rounded-full px-3.5 py-2 focus:outline-none focus:border-forest cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Tarif Terendah</option>
              <option value="price_desc">Tarif Tertinggi</option>
            </select>
          </div>

          <!-- View Mode Toggle (Grid / List) -->
          <div class="hidden sm:flex items-center bg-stone-100 dark:bg-stone-900 p-1 rounded-full border border-theme-border">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-1.5 rounded-full transition cursor-pointer',
                viewMode === 'grid' ? 'bg-theme-card text-forest dark:text-forest-glow shadow-sm' : 'text-stone-400 hover:text-theme-primary',
              ]"
              title="Tampilan Grid"
              aria-label="Tampilan Grid"
            >
              <IconGrid :size="16" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-1.5 rounded-full transition cursor-pointer',
                viewMode === 'list' ? 'bg-theme-card text-forest dark:text-forest-glow shadow-sm' : 'text-stone-400 hover:text-theme-primary',
              ]"
              title="Tampilan List"
              aria-label="Tampilan List"
            >
              <IconList :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filters Chips -->
      <div v-if="activeFiltersCount > 0" class="flex flex-wrap items-center gap-2 mb-6">
        <span class="text-xs text-stone-500 font-bold">Filter Aktif:</span>

        <span
          v-if="selectedCategory !== ProductCategory.ALL"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-forest/15 dark:bg-forest/25 text-forest dark:text-forest-glow border border-forest/30 px-3 py-1 rounded-full"
        >
          <span>Kategori: {{ ProductCategoryLabel[selectedCategory] }}</span>
          <button @click="setCategory(ProductCategory.ALL)" class="hover:text-stone-900 ml-0.5">
            <IconClose :size="12" />
          </button>
        </span>

        <span
          v-if="searchQuery"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-stone-200 dark:bg-stone-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
        >
          <span>Cari: "{{ searchQuery }}"</span>
          <button @click="setSearch('')" class="hover:text-stone-900 ml-0.5">
            <IconClose :size="12" />
          </button>
        </span>

        <span
          v-if="selectedPriceRange !== 'ALL'"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-stone-200 dark:bg-stone-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
        >
          <span>{{ priceRangeOptions.find(p => p.id === selectedPriceRange)?.label }}</span>
          <button @click="selectedPriceRange = 'ALL'" class="hover:text-stone-900 ml-0.5">
            <IconClose :size="12" />
          </button>
        </span>

        <span
          v-for="loc in selectedLocations"
          :key="loc"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-stone-200 dark:bg-stone-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
        >
          <span>Lokasi: {{ loc }}</span>
          <button @click="toggleLocation(loc)" class="hover:text-stone-900 ml-0.5">
            <IconClose :size="12" />
          </button>
        </span>

        <span
          v-for="cond in selectedConditions"
          :key="cond"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-stone-200 dark:bg-stone-800 text-theme-primary border border-theme-border px-3 py-1 rounded-full"
        >
          <span>Kondisi: {{ cond === ItemCondition.LIKE_NEW ? 'Like New (99%)' : 'Good (95%)' }}</span>
          <button @click="toggleCondition(cond)" class="hover:text-stone-900 ml-0.5">
            <IconClose :size="12" />
          </button>
        </span>

        <button
          @click="resetAllFilters"
          class="text-xs font-bold text-terracotta hover:underline ml-2 cursor-pointer"
        >
          Reset Semua ({{ activeFiltersCount }})
        </button>
      </div>

      <!-- Main Layout: Sidebar Filter + Catalog Products -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Desktop Sticky Filter Sidebar -->
        <aside class="hidden lg:block lg:col-span-3 sticky top-28 space-y-6 bg-theme-card rounded-3xl p-5 border border-theme-border shadow-card">
          <div class="flex items-center justify-between pb-3 border-b border-theme-border">
            <div class="flex items-center gap-2">
              <IconSliders :size="18" class="text-forest dark:text-forest-glow" />
              <h2 class="font-bold text-sm text-theme-primary">Filter Unit</h2>
            </div>
            <button
              v-if="activeFiltersCount > 0"
              @click="resetAllFilters"
              class="text-xs text-stone-500 hover:text-forest dark:hover:text-forest-glow font-bold cursor-pointer transition"
            >
              Reset
            </button>
          </div>

          <!-- Filter Section 1: Kategori -->
          <div>
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Kategori Barang
            </h3>
            <div class="space-y-1">
              <button
                v-for="opt in categoryOptions"
                :key="opt.value"
                @click="setCategory(opt.value)"
                :class="[
                  'w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl font-bold transition cursor-pointer text-left',
                  selectedCategory === opt.value
                    ? 'bg-forest/15 dark:bg-forest/25 text-forest dark:text-forest-glow font-black'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800',
                ]"
              >
                <span>{{ opt.label }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold">
                  {{ getCategoryCount(opt.value) }}
                </span>
              </button>
            </div>
          </div>

          <!-- Filter Section 2: Rentang Tarif Sewa -->
          <div class="pt-4 border-t border-theme-border">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Tarif Sewa / Hari
            </h3>
            <div class="space-y-2">
              <label
                v-for="p in priceRangeOptions"
                :key="p.id"
                class="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:text-forest transition"
              >
                <input
                  type="radio"
                  name="priceRange"
                  :value="p.id"
                  v-model="selectedPriceRange"
                  class="text-forest focus:ring-forest cursor-pointer"
                />
                <span>{{ p.label }}</span>
              </label>
            </div>
          </div>

          <!-- Filter Section 3: Lokasi Hub -->
          <div class="pt-4 border-t border-theme-border">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Lokasi Layanan / Hub
            </h3>
            <div class="space-y-2">
              <label
                v-for="loc in availableLocations"
                :key="loc"
                class="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:text-forest transition"
              >
                <input
                  type="checkbox"
                  :checked="selectedLocations.includes(loc)"
                  @change="toggleLocation(loc)"
                  class="rounded text-forest focus:ring-forest cursor-pointer"
                />
                <span>{{ loc }}</span>
              </label>
            </div>
          </div>

          <!-- Filter Section 4: Kondisi Unit -->
          <div class="pt-4 border-t border-theme-border">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-3">
              Kondisi Unit
            </h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:text-forest transition">
                <input
                  type="checkbox"
                  :checked="selectedConditions.includes(ItemCondition.LIKE_NEW)"
                  @change="toggleCondition(ItemCondition.LIKE_NEW)"
                  class="rounded text-forest focus:ring-forest cursor-pointer"
                />
                <span>Seperti Baru / Like New (99%)</span>
              </label>
              <label class="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:text-forest transition">
                <input
                  type="checkbox"
                  :checked="selectedConditions.includes(ItemCondition.GOOD)"
                  @change="toggleCondition(ItemCondition.GOOD)"
                  class="rounded text-forest focus:ring-forest cursor-pointer"
                />
                <span>Sangat Baik / Good (95%)</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Catalog Product Grid / List -->
        <div class="lg:col-span-9 space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-24">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest dark:border-forest-glow border-t-transparent"></div>
            <p class="text-xs text-stone-500 font-semibold mt-3">Memuat katalog perlengkapan...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="text-center py-20 bg-theme-card rounded-3xl border border-theme-border p-8 shadow-card">
            <div class="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-900 border border-theme-border flex items-center justify-center mx-auto text-stone-400 mb-3">
              <IconSearch :size="24" />
            </div>
            <h3 class="font-bold text-base text-theme-primary">Tidak Ada Unit yang Cocok</h3>
            <p class="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Kombinasi filter yang Anda pilih saat ini tidak menemukan unit. Coba sesuaikan kata kunci atau reset filter.
            </p>
            <button
              @click="resetAllFilters"
              class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-forest-glow hover:underline cursor-pointer"
            >
              <span>Reset Semua Filter</span>
            </button>
          </div>

          <!-- Grid View Mode -->
          <div
            v-else-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              @select-product="openProductModal"
              @quick-add-to-cart="handleQuickAddToCart"
            />
          </div>

          <!-- List View Mode -->
          <div
            v-else
            class="space-y-4"
          >
            <ProductListRow
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              @select-product="openProductModal"
              @quick-add-to-cart="handleQuickAddToCart"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Filter Drawer -->
    <div v-if="mobileFilterOpen" class="fixed inset-0 z-50 flex">
      <!-- Backdrop -->
      <div @click="mobileFilterOpen = false" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Drawer Content -->
      <div class="relative ml-auto w-full max-w-xs bg-theme-card h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between z-10 custom-scrollbar">
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-theme-border">
            <h2 class="font-bold text-base text-theme-primary">Filter Unit</h2>
            <button @click="mobileFilterOpen = false" class="p-1 text-stone-400 hover:text-theme-primary cursor-pointer">
              <IconClose :size="18" />
            </button>
          </div>

          <!-- Mobile Kategori -->
          <div>
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-2">Kategori</h3>
            <div class="space-y-1">
              <button
                v-for="opt in categoryOptions"
                :key="opt.value"
                @click="() => { setCategory(opt.value); mobileFilterOpen = false; }"
                :class="[
                  'w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl font-bold transition text-left',
                  selectedCategory === opt.value ? 'bg-forest/20 text-forest font-black' : 'text-stone-600 dark:text-stone-300',
                ]"
              >
                <span>{{ opt.label }}</span>
                <span class="text-[10px]">{{ getCategoryCount(opt.value) }}</span>
              </button>
            </div>
          </div>

          <!-- Mobile Price Range -->
          <div class="pt-4 border-t border-theme-border">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-stone-400 mb-2">Tarif Sewa</h3>
            <div class="space-y-2">
              <label
                v-for="p in priceRangeOptions"
                :key="p.id"
                class="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300"
              >
                <input type="radio" :value="p.id" v-model="selectedPriceRange" class="text-forest" />
                <span>{{ p.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-theme-border space-y-2">
          <BaseButton @click="mobileFilterOpen = false" variant="primary" size="md" class="w-full">
            Terapkan Filter ({{ filteredProducts.length }} Unit)
          </BaseButton>
          <button
            @click="() => { resetAllFilters(); mobileFilterOpen = false; }"
            class="w-full text-xs font-bold text-stone-500 hover:text-theme-primary py-2"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <ProductDetailModal
      v-if="selectedProductForModal"
      :product="selectedProductForModal"
      @close="closeProductModal"
    />

    <!-- Global Cart Drawer -->
    <CartDrawer />

    <!-- Global Footer -->
    <AppFooter />
  </div>
</template>
