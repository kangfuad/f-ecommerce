<script setup lang="ts">
import { Product } from '@/domain/entities/Product'
import { useWishlist } from '@/presentation/composables/useWishlist'
import BaseButton from '../common/BaseButton.vue'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'
import {
  IconHeartWishlist,
  IconLocation,
  IconStar,
  IconCheck,
} from '@/presentation/components/icons'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-product', product: Product): void
  (e: 'quick-rent', product: Product): void
}>()

const { isWishlisted, toggleWishlist } = useWishlist()
</script>

<template>
  <div class="card-hover bg-theme-card rounded-3xl border border-theme-border p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-stretch shadow-card group">
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

      <!-- Wishlist button -->
      <button
        @click.stop="toggleWishlist(product.id)"
        class="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white text-stone-800 border border-stone-200 shadow-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
        aria-label="Simpan Favorit"
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
          @click="emit('select-product', product)"
          class="font-bold text-base sm:text-lg text-theme-primary hover:text-forest dark:hover:text-forest-glow transition-colors cursor-pointer"
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

        <div class="flex items-center gap-2">
          <BaseButton
            @click="emit('select-product', product)"
            variant="outline"
            size="sm"
          >
            Detail Unit
          </BaseButton>
          <BaseButton
            @click="emit('quick-rent', product)"
            variant="primary"
            size="sm"
          >
            Sewa Sekarang
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
