<script setup lang="ts">
import { ref } from 'vue'
import { Product } from '@/domain/entities/Product'
import { useWishlist } from '@/presentation/composables/useWishlist'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'
import QuickDatePopover from './QuickDatePopover.vue'
import {
  IconHeartWishlist,
  IconLocation,
  IconStar,
  IconCartBag,
  IconCheck,
} from '@/presentation/components/icons'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-product', product: Product): void
  (e: 'quick-add-to-cart', product: Product, startDate?: string, endDate?: string): void
}>()

const { isWishlisted, toggleWishlist } = useWishlist()
const isAdded = ref(false)
const showDatePopover = ref(false)

function handleButtonClick() {
  showDatePopover.value = !showDatePopover.value
}

function handleDateSelected(startDate: string, endDate: string) {
  showDatePopover.value = false
  emit('quick-add-to-cart', props.product, startDate, endDate)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 1500)
}
</script>

<template>
  <div
    @click="emit('select-product', product)"
    class="card-hover bg-theme-card rounded-3xl border border-theme-border hover:border-forest/50 dark:hover:border-forest-glow/50 p-3.5 sm:p-4 flex flex-col justify-between group overflow-visible shadow-card cursor-pointer transition-all relative"
  >
    <!-- Image Container with Anti-Camouflage Scrim -->
    <div>
      <div class="relative bg-stone-100 dark:bg-stone-900 rounded-2xl aspect-square overflow-hidden mb-3.5 border border-stone-200/80 dark:border-stone-800">
        <img
          :src="product.primaryImage"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          loading="lazy"
        />

        <!-- Subtle Ambient Vignette / Scrim -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-[1]"></div>

        <!-- Top Left Badges -->
        <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10">
          <span
            v-if="product.badgeText"
            class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#244E33] text-white shadow-[0_2px_8px_rgba(0,0,0,0.45)] border border-emerald-400/40"
          >
            {{ product.badgeText }}
          </span>

          <span
            class="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-white text-stone-900 border border-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.35)] tracking-wide"
          >
            {{ ItemConditionLabel[product.condition] }}
          </span>
        </div>

        <!-- Wishlist Button with Solid Contrast (Isolated with @click.stop) -->
        <button
          @click.stop="toggleWishlist(product.id)"
          class="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white text-stone-800 border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.30)] flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
          aria-label="Simpan Favorit"
          title="Simpan Favorit"
        >
          <IconHeartWishlist
            :size="15"
            :filled="isWishlisted(product.id)"
            :class="isWishlisted(product.id) ? 'text-terracotta' : 'text-stone-700'"
          />
        </button>

        <!-- Location tag on bottom left of image -->
        <div class="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-stone-950/85 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
          <IconLocation :size="11" class="text-forest-soft" />
          <span class="truncate max-w-[120px] font-semibold">{{ product.location }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <IconStar :size="13" />
            <span class="text-xs font-bold text-theme-primary">{{ product.rating }}</span>
            <span class="text-[10px] text-stone-500 dark:text-stone-400">({{ product.reviewCount }})</span>
          </div>
          <span class="text-[10px] font-extrabold text-forest dark:text-forest-glow bg-forest/10 dark:bg-forest-glow/15 border border-forest/30 dark:border-forest-glow/30 px-2 py-0.5 rounded-full">
            Unit Siap Sewa
          </span>
        </div>

        <h3
          class="font-bold text-sm sm:text-base text-theme-primary line-clamp-2 group-hover:text-forest dark:group-hover:text-forest-glow transition-colors"
        >
          {{ product.name }}
        </h3>
        <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 font-normal">{{ product.description }}</p>
      </div>
    </div>

    <!-- Pricing & Micro-Animated Add-to-Cart Action -->
    <div class="mt-4 pt-3.5 border-t border-theme-border flex items-center justify-between gap-3 relative">
      <div>
        <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block">Tarif Sewa</span>
        <p class="font-black text-sm sm:text-base text-forest dark:text-forest-glow leading-tight">
          {{ product.dailyRate.format() }}<span class="text-[11px] font-normal text-stone-500">/hari</span>
        </p>
      </div>

      <!-- Quick Add Button with Popover -->
      <div class="relative">
        <button
          @click.stop="handleButtonClick"
          :class="[
            'inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full shadow-sm transition-all duration-300 cursor-pointer shrink-0',
            isAdded
              ? 'bg-emerald-600 text-white scale-105 shadow-md ring-2 ring-emerald-400/40'
              : 'bg-[#244E33] hover:bg-[#1B3B26] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-stone-950 hover:scale-103 active:scale-97'
          ]"
          :title="isAdded ? 'Berhasil Masuk Keranjang!' : 'Sewa Cepat (Pilih Durasi & Masuk Keranjang)'"
        >
          <IconCheck v-if="isAdded" :size="13" class="animate-bounce" />
          <IconCartBag v-else :size="13" />
          <span>{{ isAdded ? '✓ Masuk' : '+ Keranjang' }}</span>
        </button>

        <!-- Quick Date Popover -->
        <QuickDatePopover
          v-if="showDatePopover"
          @select-dates="handleDateSelected"
          @close="showDatePopover = false"
        />
      </div>
    </div>
  </div>
</template>
