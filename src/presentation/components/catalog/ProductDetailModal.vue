<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Product } from '@/domain/entities/Product'
import { useRentalCalculator } from '@/presentation/composables/useRentalCalculator'
import { useCart } from '@/presentation/composables/useCart'
import { useAuth } from '@/presentation/composables/useAuth'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { useImageLightbox } from '@/presentation/composables/useImageLightbox'
import { useToast } from '@/presentation/composables/useToast'
import DateRangePicker from '../rental/DateRangePicker.vue'
import RentalPriceBreakdown from '../rental/RentalPriceBreakdown.vue'
import BaseButton from '../common/BaseButton.vue'
import { formatRupiah } from '@/core/utils/currency'
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
const { isLoggedIn, openLoginModal } = useAuth()
const { openLightbox } = useImageLightbox()
const { showToast } = useToast()

async function copyProductLink() {
  if (!props.product) return
  const url = `${window.location.origin}/produk/${props.product.id}`
  const shareData = {
    title: `${props.product.name} — e-punyasewa`,
    text: `Sewa ${props.product.name} (${formatRupiah(props.product.dailyRate.amount)}/hari) di e-punyasewa. Bebas Deposit Rp 0 & Garansi QC 100%!`,
    url,
  }

  // 1. Native Web Share API (Mobile WhatsApp, Instagram, Telegram, Twitter/X)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // User cancelled share dialog, continue
    }
  }

  // 2. Fallback to Clipboard Copy
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Tautan Produk Disalin!',
        message: 'Link produk berhasil disalin dan siap dibagikan.',
      })
    }).catch(() => {
      showToast({ type: 'info', title: 'Tautan Produk', message: url })
    })
  } else {
    showToast({ type: 'info', title: 'Tautan Produk', message: url })
  }
}

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
  if (!isLoggedIn.value) {
    openLoginModal()
    return
  }
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
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div
      @click="emit('close')"
      class="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
    ></div>

    <!-- Modal Card Container -->
    <div class="relative bg-theme-card rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] my-auto overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary">
      <!-- Action Buttons Top-Right -->
      <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          @click="copyProductLink"
          class="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700 border border-theme-border shadow-md flex items-center justify-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Salin tautan produk untuk dibagikan"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span class="hidden sm:inline">Bagikan</span>
        </button>

        <button
          @click="emit('close')"
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700 border border-theme-border shadow-md flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup Dialog"
          title="Tutup (Esc)"
        >
          <IconClose :size="15" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 min-w-0">
        <!-- Left: Image Gallery & Included Items -->
        <div class="md:col-span-6 space-y-4 min-w-0">
          <!-- Main Image Gallery with Prev/Next Navigation & Zoom Lightbox -->
          <div
            @click="openLightbox(productImages, product.name, activeImageIndex)"
            class="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-4/3 sm:aspect-square border border-stone-200/80 dark:border-stone-800 select-none group cursor-zoom-in min-w-0"
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
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
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
              class="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Foto Sebelumnya"
              title="Foto Sebelumnya (←)"
            >
              <IconChevronLeft :size="16" />
            </button>

            <!-- Next Image Button -->
            <button
              v-if="productImages.length > 1"
              @click.stop="nextImage"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Foto Selanjutnya"
              title="Foto Selanjutnya (→)"
            >
              <IconChevronRight :size="16" />
            </button>

            <!-- Image Pagination Counter Indicator -->
            <div
              v-if="productImages.length > 1"
              class="absolute bottom-3 right-3 z-10 bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/15 shadow-md"
            >
              {{ activeImageIndex + 1 }} / {{ productImages.length }}
            </div>

            <!-- Location Pill -->
            <div class="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-stone-950/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full border border-white/15 shadow-md max-w-[60%] truncate">
              <IconLocation :size="11" class="text-forest-soft shrink-0" />
              <span class="font-semibold truncate">{{ product.location }}</span>
            </div>
          </div>

          <!-- Clickable Thumbnails Strip -->
          <div v-if="productImages.length > 1" class="flex gap-2 overflow-x-auto custom-scrollbar pb-1 min-w-0">
            <button
              v-for="(img, idx) in productImages"
              :key="idx"
              @click="activeImageIndex = idx"
              :class="[
                'relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 dark:bg-stone-900 shrink-0',
                activeImageIndex === idx
                  ? 'border-forest ring-2 ring-forest/30 scale-102'
                  : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100',
              ]"
            >
              <img :src="img" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Included Package Checklist -->
          <div class="bg-stone-50 dark:bg-stone-900/90 rounded-2xl p-3.5 sm:p-4 border border-theme-border min-w-0">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-theme-primary mb-2 flex items-center gap-1.5">
              <IconBoxPackage :size="15" class="text-forest dark:text-forest-glow shrink-0" />
              <span>Kelengkapan Paket Unit</span>
            </h3>
            <ul class="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <li v-for="(item, idx) in product.includedItems" :key="idx" class="flex items-start gap-2 min-w-0">
                <IconCheck :size="13" class="text-forest dark:text-forest-glow font-bold shrink-0 mt-0.5" />
                <span class="break-words min-w-0">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Streamlined Booking & Price Breakdown -->
        <div class="md:col-span-6 space-y-4 min-w-0">
          <!-- Title & Rating Header -->
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <IconStar :size="14" class="shrink-0" />
              <span class="text-xs font-extrabold text-theme-primary">{{ product.rating }}</span>
              <span class="text-xs text-stone-500 truncate">({{ product.reviewCount }} ulasan)</span>
            </div>
            <h2 class="font-display text-lg sm:text-2xl font-extrabold text-theme-primary leading-snug break-words">
              {{ product.name }}
            </h2>
            <p class="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-normal break-words">
              {{ product.description }}
            </p>
          </div>

          <!-- Rates Quick Info Bar -->
          <div class="grid grid-cols-2 gap-2 sm:gap-3 bg-stone-50 dark:bg-stone-900/80 border border-theme-border p-3 rounded-2xl min-w-0">
            <div class="min-w-0">
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block truncate">Tarif Sewa / Hari</span>
              <p class="text-sm sm:text-lg font-black text-forest dark:text-forest-glow truncate">{{ product.dailyRate.format() }}</p>
            </div>
            <div class="pl-2.5 sm:pl-3 border-l border-theme-border min-w-0">
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block truncate">Deposit (100% Refundable)</span>
              <p class="text-xs sm:text-sm font-extrabold text-theme-primary truncate">{{ product.depositAmount.format() }}</p>
            </div>
          </div>

          <!-- Step 1: Date Range Picker -->
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 mb-1.5 block">
              1. Pilih Tanggal Sewa & Pengembalian
            </span>
            <DateRangePicker
              v-model:startDate="startDate"
              v-model:endDate="endDate"
            />
          </div>

          <!-- Step 2: Quantity Control -->
          <div class="flex items-center justify-between bg-stone-50 dark:bg-stone-900/80 border border-theme-border rounded-2xl px-3.5 sm:px-4 py-2.5 min-w-0 gap-2">
            <div class="min-w-0">
              <span class="text-xs font-bold text-theme-primary block truncate">Jumlah Unit</span>
              <span class="text-[10px] text-stone-500 block truncate">Maksimal 3 unit per transaksi</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
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
          <div v-if="calculationError" class="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/60 flex items-center gap-2 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0"></span>
            <span class="break-words min-w-0">{{ calculationError }}</span>
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
            class="w-full cursor-pointer shadow-md text-xs sm:text-sm font-black"
          >
            <span>Tambahkan ke Keranjang</span>
            <span v-if="currentBooking" class="truncate">({{ currentBooking.totalCheckoutAmount.format() }})</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
