<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Product } from '@/domain/entities/Product'
import { useRentalCalculator } from '@/presentation/composables/useRentalCalculator'
import { useCart } from '@/presentation/composables/useCart'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { useImageLightbox } from '@/presentation/composables/useImageLightbox'
import DateRangePicker from '../rental/DateRangePicker.vue'
import RentalPriceBreakdown from '../rental/RentalPriceBreakdown.vue'
import BaseButton from '../common/BaseButton.vue'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'
import {
  IconClose,
  IconBoxPackage,
  IconStar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLocation,
} from '@/presentation/components/icons'

interface Props {
  product: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeImageIndex = ref(0)
const { addToCart, isLoading: isAddingToCart } = useCart()
const { openLightbox } = useImageLightbox()

// Lock background page scroll when modal is open
useBodyScrollLock(() => !!props.product)

const productImages = computed(() => {
  if (!props.product) return []
  if (props.product.images && props.product.images.length > 0) {
    return props.product.images
  }
  return [props.product.primaryImage]
})

function prevImage() {
  if (productImages.value.length <= 1) return
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--
  } else {
    activeImageIndex.value = productImages.value.length - 1
  }
}

function nextImage() {
  if (productImages.value.length <= 1) return
  if (activeImageIndex.value < productImages.value.length - 1) {
    activeImageIndex.value++
  } else {
    activeImageIndex.value = 0
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

watch(
  () => props.product,
  () => {
    activeImageIndex.value = 0
  }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

const {
  startDate,
  endDate,
  quantity,
  includeInsurance,
  currentBooking,
  calculationError,
  setQuantity,
  toggleInsurance,
} = useRentalCalculator(() => props.product)

async function handleAddToCart() {
  if (!props.product || !currentBooking.value) return
  try {
    await addToCart(
      {
        productId: props.product.id,
        startDate: startDate.value,
        endDate: endDate.value,
        quantity: quantity.value,
        includeInsurance: includeInsurance.value,
      },
      false, // Do NOT force open drawer
      props.product.name
    )
    emit('close')
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div
      @click="emit('close')"
      class="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
    ></div>

    <!-- Modal Card Container -->
    <div class="relative bg-theme-card rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700 border border-theme-border shadow-md flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
        aria-label="Tutup Dialog"
        title="Tutup (Esc)"
      >
        <IconClose :size="16" />
      </button>

      <div class="grid md:grid-cols-12 gap-6 p-5 sm:p-7 md:p-8">
        <!-- Left: Image Gallery & Included Items -->
        <div class="md:col-span-6 space-y-4">
          <!-- Main Image Gallery with Prev/Next Navigation & Zoom Lightbox -->
          <div
            @click="openLightbox(productImages, product.name, activeImageIndex)"
            class="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-square border border-stone-200/80 dark:border-stone-800 select-none group cursor-zoom-in"
            title="Klik untuk melihat foto ukuran penuh"
          >
            <img
              :src="productImages[activeImageIndex]"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <!-- Ambient Scrim Top & Bottom -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-[1]"></div>

            <!-- Top Badges -->
            <div class="absolute top-3 left-3 flex gap-1.5 z-10">
              <span
                class="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-white text-stone-900 border border-stone-300 shadow-md tracking-wide"
              >
                {{ ItemConditionLabel[product.condition] }}
              </span>
              <span
                v-if="product.badgeText"
                class="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#244E33] text-white shadow-md border border-emerald-400/40"
              >
                {{ product.badgeText }}
              </span>
            </div>

            <!-- Prev Image Button -->
            <button
              v-if="productImages.length > 1"
              @click.stop="prevImage"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Foto Sebelumnya"
              title="Foto Sebelumnya (←)"
            >
              <IconChevronLeft :size="18" />
            </button>

            <!-- Next Image Button -->
            <button
              v-if="productImages.length > 1"
              @click.stop="nextImage"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Foto Selanjutnya"
              title="Foto Selanjutnya (→)"
            >
              <IconChevronRight :size="18" />
            </button>

            <!-- Image Pagination Counter Indicator -->
            <div
              v-if="productImages.length > 1"
              class="absolute bottom-3 right-3 z-10 bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/15 shadow-md"
            >
              {{ activeImageIndex + 1 }} / {{ productImages.length }}
            </div>

            <!-- Location Pill -->
            <div class="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-stone-950/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full border border-white/15 shadow-md">
              <IconLocation :size="11" class="text-forest-soft" />
              <span class="font-semibold">{{ product.location }}</span>
            </div>
          </div>

          <!-- Clickable Thumbnails Strip -->
          <div v-if="productImages.length > 1" class="flex gap-2">
            <button
              v-for="(img, idx) in productImages"
              :key="idx"
              @click="activeImageIndex = idx"
              :class="[
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 dark:bg-stone-900 shrink-0',
                activeImageIndex === idx
                  ? 'border-forest ring-2 ring-forest/30 scale-102'
                  : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100',
              ]"
            >
              <img :src="img" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Included Package Checklist -->
          <div class="bg-stone-50 dark:bg-stone-900/90 rounded-2xl p-4 border border-theme-border">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-theme-primary mb-2 flex items-center gap-1.5">
              <IconBoxPackage :size="15" class="text-forest dark:text-forest-glow" />
              <span>Kelengkapan Paket Unit</span>
            </h3>
            <ul class="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <li v-for="(item, idx) in product.includedItems" :key="idx" class="flex items-center gap-2">
                <IconCheck :size="13" class="text-forest dark:text-forest-glow font-bold shrink-0" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Streamlined Booking & Price Breakdown -->
        <div class="md:col-span-6 space-y-4">
          <!-- Title & Rating Header -->
          <div>
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <IconStar :size="14" />
              <span class="text-xs font-extrabold text-theme-primary">{{ product.rating }}</span>
              <span class="text-xs text-stone-500">({{ product.reviewCount }} ulasan terverifikasi)</span>
            </div>
            <h2 class="font-display text-xl sm:text-2xl font-extrabold text-theme-primary leading-snug">
              {{ product.name }}
            </h2>
            <p class="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-normal">
              {{ product.description }}
            </p>
          </div>

          <!-- Rates Quick Info Bar -->
          <div class="grid grid-cols-2 gap-3 bg-stone-50 dark:bg-stone-900/80 border border-theme-border p-3 rounded-2xl">
            <div>
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">Tarif Sewa / Hari</span>
              <p class="text-lg font-black text-forest dark:text-forest-glow">{{ product.dailyRate.format() }}</p>
            </div>
            <div class="pl-3 border-l border-theme-border">
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">Deposit (100% Refundable)</span>
              <p class="text-sm font-extrabold text-theme-primary">{{ product.depositAmount.format() }}</p>
            </div>
          </div>

          <!-- Step 1: Date Range Picker -->
          <div>
            <span class="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 mb-1.5 block">
              1. Pilih Tanggal Sewa & Pengembalian
            </span>
            <DateRangePicker
              v-model:startDate="startDate"
              v-model:endDate="endDate"
            />
          </div>

          <!-- Step 2: Quantity Control -->
          <div class="flex items-center justify-between bg-stone-50 dark:bg-stone-900/80 border border-theme-border rounded-2xl px-4 py-2.5">
            <div>
              <span class="text-xs font-bold text-theme-primary block">Jumlah Unit</span>
              <span class="text-[10px] text-stone-500">Maksimal 3 unit per transaksi</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="setQuantity(quantity - 1)"
                type="button"
                class="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 border border-theme-border flex items-center justify-center text-sm font-bold text-theme-primary hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer transition"
              >
                -
              </button>
              <span class="text-xs font-black w-6 text-center text-theme-primary">{{ quantity }}</span>
              <button
                @click="setQuantity(quantity + 1)"
                type="button"
                class="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 border border-theme-border flex items-center justify-center text-sm font-bold text-theme-primary hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer transition"
              >
                +
              </button>
            </div>
          </div>

          <!-- Validation Error Notice if any -->
          <div v-if="calculationError" class="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/60 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0"></span>
            <span>{{ calculationError }}</span>
          </div>

          <!-- Live Price Breakdown -->
          <RentalPriceBreakdown
            v-if="currentBooking"
            :booking="currentBooking"
            :includeInsurance="includeInsurance"
            @toggle-insurance="toggleInsurance"
          />

          <!-- Action Button: Add to Cart -->
          <BaseButton
            @click="handleAddToCart"
            :loading="isAddingToCart"
            :disabled="!currentBooking"
            variant="primary"
            size="lg"
            class="w-full cursor-pointer shadow-md"
          >
            <span>Tambahkan ke Keranjang</span>
            <span v-if="currentBooking">({{ currentBooking.totalCheckoutAmount.format() }})</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
