<script setup lang="ts">
import { ref } from 'vue'
import { Product } from '@/domain/entities/Product'
import { useRentalCalculator } from '@/presentation/composables/useRentalCalculator'
import { useCart } from '@/presentation/composables/useCart'
import DateRangePicker from '../rental/DateRangePicker.vue'
import RentalPriceBreakdown from '../rental/RentalPriceBreakdown.vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'

interface Props {
  product: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeImageIndex = ref(0)
const { addToCart, isLoading: isAddingToCart } = useCart()

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
    await addToCart({
      productId: props.product.id,
      startDate: startDate.value,
      endDate: endDate.value,
      quantity: quantity.value,
      includeInsurance: includeInsurance.value,
    })
    emit('close')
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
    <!-- Backdrop -->
    <div
      @click="emit('close')"
      class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
    ></div>

    <!-- Modal Card -->
    <div class="relative bg-theme-card rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-theme-border shadow-md flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        aria-label="Tutup Modal"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="grid md:grid-cols-12 gap-6 p-6 sm:p-8">
        <!-- Left: Image Gallery & Specs -->
        <div class="md:col-span-6 space-y-4">
          <!-- Main Image -->
          <div class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 aspect-square border border-slate-200 dark:border-zinc-800">
            <img
              :src="product.images[activeImageIndex] || product.primaryImage"
              :alt="product.name"
              class="w-full h-full object-cover opacity-95"
            />
            <div class="absolute top-3 left-3 flex gap-1.5">
              <BaseBadge variant="primary">
                {{ ItemConditionLabel[product.condition] }}
              </BaseBadge>
              <BaseBadge v-if="product.badgeText" variant="coral">
                {{ product.badgeText }}
              </BaseBadge>
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="product.images.length > 1" class="flex gap-2">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              @click="activeImageIndex = idx"
              :class="[
                'w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 dark:bg-zinc-900',
                activeImageIndex === idx ? 'border-sage ring-2 ring-sage/30' : 'border-transparent opacity-60 hover:opacity-100'
              ]"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Included in Box Checklist -->
          <div class="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-theme-border">
            <h4 class="text-xs font-bold uppercase tracking-wider text-theme-primary mb-2 flex items-center gap-1.5">
              <svg class="text-sage dark:text-sage-soft" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Kelengkapan Dalam Paket Sewa
            </h4>
            <ul class="space-y-1.5 text-xs text-theme-muted">
              <li v-for="(item, idx) in product.includedItems" :key="idx" class="flex items-center gap-2">
                <span class="text-sage dark:text-sage-soft font-bold">✓</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Detail & Rental Calculation -->
        <div class="md:col-span-6 space-y-5">
          <div>
            <div class="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span class="text-xs font-bold text-theme-primary">{{ product.rating }}</span>
              <span class="text-xs text-theme-muted">({{ product.reviewCount }})</span>
            </div>
            <h2 class="font-display text-xl sm:text-2xl font-bold text-theme-primary">
              {{ product.name }}
            </h2>
            <p class="text-xs text-theme-muted mt-2 leading-relaxed font-light">
              {{ product.description }}
            </p>
          </div>

          <!-- Pricing overview -->
          <div class="flex items-baseline gap-4 bg-slate-50 dark:bg-zinc-900 border border-theme-border p-3.5 rounded-2xl">
            <div>
              <span class="text-[10px] text-theme-muted uppercase font-semibold">Tarif Sewa Harian</span>
              <p class="text-xl font-extrabold text-sage-hover dark:text-sage-soft">{{ product.dailyRate.format() }}<span class="text-xs font-normal text-theme-muted">/hari</span></p>
            </div>
            <div class="border-l border-slate-200 dark:border-zinc-800 pl-4">
              <span class="text-[10px] text-theme-muted uppercase font-semibold">Deposit Jaminan</span>
              <p class="text-sm font-bold text-theme-primary">{{ product.depositAmount.format() }}</p>
            </div>
          </div>

          <!-- Interactive Date Range Picker -->
          <DateRangePicker
            v-model:startDate="startDate"
            v-model:endDate="endDate"
          />

          <!-- Quantity Control -->
          <div class="flex items-center justify-between bg-slate-50 dark:bg-zinc-900 border border-theme-border rounded-2xl p-3">
            <span class="text-xs font-semibold text-theme-primary">Jumlah Unit Sewa</span>
            <div class="flex items-center gap-2">
              <button
                @click="setQuantity(quantity - 1)"
                type="button"
                class="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-theme-border flex items-center justify-center text-sm font-bold text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                -
              </button>
              <span class="text-xs font-bold w-6 text-center text-theme-primary">{{ quantity }}</span>
              <button
                @click="setQuantity(quantity + 1)"
                type="button"
                class="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-theme-border flex items-center justify-center text-sm font-bold text-theme-primary hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <!-- Calculation Error if any -->
          <div v-if="calculationError" class="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/60">
            ⚠️ {{ calculationError }}
          </div>

          <!-- Live Breakdown Component -->
          <RentalPriceBreakdown
            v-if="currentBooking"
            :booking="currentBooking"
            :includeInsurance="includeInsurance"
            @toggle-insurance="toggleInsurance"
          />

          <!-- Action Button -->
          <BaseButton
            @click="handleAddToCart"
            :loading="isAddingToCart"
            :disabled="!currentBooking"
            variant="primary"
            size="lg"
            class="w-full cursor-pointer shadow-md"
          >
            <span>Tambahkan ke Keranjang Sewa</span>
            <span v-if="currentBooking">({{ currentBooking.totalCheckoutAmount.format() }})</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
