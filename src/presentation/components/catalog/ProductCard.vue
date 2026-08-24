<script setup lang="ts">
import { Product } from '@/domain/entities/Product'
import { useWishlist } from '@/presentation/composables/useWishlist'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'

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
  <div class="card-hover bg-theme-card rounded-3xl border border-theme-border p-3.5 sm:p-4 flex flex-col justify-between group overflow-hidden shadow-card">
    <!-- Image & Top Badges -->
    <div>
      <div class="relative bg-slate-100 dark:bg-zinc-900 rounded-2xl aspect-square overflow-hidden mb-3.5 border border-slate-200 dark:border-zinc-800/80">
        <img
          :src="product.primaryImage"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          loading="lazy"
        />

        <!-- Top Left Badges -->
        <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <BaseBadge v-if="product.badgeText" variant="primary">
            {{ product.badgeText }}
          </BaseBadge>
          <span class="text-[9px] font-bold bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-theme-muted px-2 py-0.5 rounded-full border border-theme-border shadow-sm">
            {{ ItemConditionLabel[product.condition] }}
          </span>
        </div>

        <!-- Wishlist Button -->
        <button
          @click.stop="toggleWishlist(product.id)"
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-theme-border shadow-sm flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
          aria-label="Simpan Favorit"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            :fill="isWishlisted(product.id) ? '#84A98C' : 'none'"
            :stroke="isWishlisted(product.id) ? '#84A98C' : 'currentColor'"
            class="text-theme-muted"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        </button>

        <!-- Location tag on bottom left of image -->
        <div class="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-900/80 dark:bg-zinc-950/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10 dark:border-zinc-800">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="truncate max-w-[120px]">{{ product.location }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 text-amber-500 dark:text-amber-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span class="text-xs font-bold text-theme-primary">{{ product.rating }}</span>
            <span class="text-[10px] text-theme-muted">({{ product.reviewCount }})</span>
          </div>
          <span class="text-[10px] font-bold text-sage dark:text-emerald-300 bg-sage/10 dark:bg-emerald-950/60 border border-sage/30 dark:border-emerald-800/40 px-2 py-0.5 rounded">
            Unit Siap Sewa
          </span>
        </div>

        <h3
          @click="emit('select-product', product)"
          class="font-bold text-sm sm:text-base text-theme-primary line-clamp-2 hover:text-sage dark:hover:text-sage-soft transition-colors cursor-pointer"
        >
          {{ product.name }}
        </h3>
        <p class="text-xs text-theme-muted line-clamp-1 font-light">{{ product.description }}</p>
      </div>
    </div>

    <!-- Pricing & Action -->
    <div class="pt-4 mt-4 border-t border-theme-border">
      <div class="flex items-baseline justify-between mb-3">
        <div>
          <span class="text-[10px] text-theme-muted uppercase font-semibold">Tarif Sewa</span>
          <p class="font-extrabold text-sm sm:text-base text-sage-hover dark:text-sage-soft">
            {{ product.dailyRate.format() }}<span class="text-xs font-normal text-theme-muted">/hari</span>
          </p>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-theme-muted uppercase font-semibold">Deposit Jaminan</span>
          <p class="text-xs font-bold text-theme-primary">{{ product.depositAmount.format() }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <BaseButton
          @click="emit('select-product', product)"
          variant="outline"
          size="sm"
          class="w-full"
        >
          Detail
        </BaseButton>
        <BaseButton
          @click="emit('quick-rent', product)"
          variant="primary"
          size="sm"
          class="w-full"
        >
          Sewa Sekarang
        </BaseButton>
      </div>
    </div>
  </div>
</template>
