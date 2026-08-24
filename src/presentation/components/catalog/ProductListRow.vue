<script setup lang="ts">
import { ref } from 'vue'
import { Product } from '@/domain/entities/Product'
import { useWishlist } from '@/presentation/composables/useWishlist'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'
import {
  IconHeartWishlist,
  IconLocation,
  IconStar,
  IconCheck,
  IconCartBag,
} from '@/presentation/components/icons'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-product', product: Product): void
  (e: 'quick-add-to-cart', product: Product): void
}>()

const { isWishlisted, toggleWishlist } = useWishlist()
const isAdded = ref(false)

function handleQuickAdd() {
  emit('quick-add-to-cart', props.product)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 1500)
}
</script>

<template>
  <div
    @click="emit('select-product', product)"
    class="card-hover bg-theme-card rounded-3xl border border-theme-border hover:border-forest/50 dark:hover:border-forest-glow/50 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-stretch shadow-card group cursor-pointer transition-all"
  >
    <!-- Image Thumbnail -->
    <div class="relative w-full md:w-56 h-48 md:h-auto rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0 border border-stone-200/80 dark:border-stone-800">
      <img
        :src="product.primaryImage"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        loading="lazy"
      />

      <!-- Subtle Scrim -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-[1]"></div>

      <!-- Top Badges -->
      <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
        <span
          v-if="product.badgeText"
          class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#244E33] text-white shadow-md border border-emerald-400/40"
        >
          {{ product.badgeText }}
        </span>
        <span
          class="text-[9px] font-black px-2 py-0.5 rounded-full bg-white text-stone-900 border border-stone-300 shadow-md"
        >
          {{ ItemConditionLabel[product.condition] }}
        </span>
      </div>

      <!-- Wishlist button (isolated with @click.stop) -->
      <button
        @click.stop="toggleWishlist(product.id)"
        class="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white text-stone-800 border border-stone-200 shadow-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
        aria-label="Simpan Favorit"
        title="Simpan Favorit"
      >
        <IconHeartWishlist
          :size="13"
          :filled="isWishlisted(product.id)"
          :class="isWishlisted(product.id) ? 'text-terracotta' : 'text-stone-700'"
        />
      </button>

      <!-- Location Badge -->
      <div class="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-stone-950/85 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
        <IconLocation :size="10" class="text-forest-soft" />
        <span class="truncate max-w-[120px] font-semibold">{{ product.location }}</span>
      </div>
    </div>

    <!-- Content & Specs -->
    <div class="flex-1 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <IconStar :size="14" />
            <span class="text-xs font-bold text-theme-primary">{{ product.rating }}</span>
            <span class="text-[11px] text-stone-500 dark:text-stone-400">({{ product.reviewCount }} ulasan terverifikasi)</span>
          </div>
          <span class="text-[10px] font-extrabold text-forest dark:text-forest-glow bg-forest/10 dark:bg-forest-glow/15 border border-forest/30 dark:border-forest-glow/30 px-2.5 py-0.5 rounded-full">
            Unit Siap Sewa
          </span>
        </div>

        <h3
          class="font-bold text-base sm:text-lg text-theme-primary group-hover:text-forest dark:group-hover:text-forest-glow transition-colors"
        >
          {{ product.name }}
        </h3>
        <p class="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">{{ product.description }}</p>

        <!-- Included Items Tags -->
        <div v-if="product.includedItems && product.includedItems.length > 0" class="flex flex-wrap gap-1.5 mt-3">
          <span
            v-for="(item, idx) in product.includedItems.slice(0, 3)"
            :key="idx"
            class="text-[10px] bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 flex items-center gap-1"
          >
            <IconCheck :size="10" class="text-forest dark:text-forest-glow" />
            <span>{{ item }}</span>
          </span>
          <span v-if="product.includedItems.length > 3" class="text-[10px] text-stone-500 self-center">
            +{{ product.includedItems.length - 3 }} item lainnya
          </span>
        </div>
      </div>

      <!-- Pricing & Actions Row -->
      <div class="pt-3 border-t border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-baseline gap-4">
          <div>
            <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block">Tarif Sewa</span>
            <p class="font-black text-lg text-forest dark:text-forest-glow">
              {{ product.dailyRate.format() }}<span class="text-xs font-normal text-stone-500">/hari</span>
            </p>
          </div>
          <div class="pl-4 border-l border-theme-border">
            <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block">Deposit Jaminan</span>
            <p class="text-xs font-bold text-theme-primary">{{ product.depositAmount.format() }}</p>
          </div>
        </div>

        <div>
          <!-- Quick Add Button with Micro-Feedback Animation -->
          <button
            @click.stop="handleQuickAdd"
            :class="[
              'inline-flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-full shadow-sm transition-all duration-300 cursor-pointer',
              isAdded
                ? 'bg-emerald-600 text-white scale-105 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-forest hover:bg-forest-hover dark:bg-forest dark:hover:bg-forest-hover text-white hover:scale-103 active:scale-97'
            ]"
            :title="isAdded ? 'Berhasil Masuk Keranjang!' : 'Sewa Cepat (Tambah ke Keranjang)'"
          >
            <IconCheck v-if="isAdded" :size="14" class="animate-bounce" />
            <IconCartBag v-else :size="14" />
            <span>{{ isAdded ? '✓ Masuk' : '+ Keranjang' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
