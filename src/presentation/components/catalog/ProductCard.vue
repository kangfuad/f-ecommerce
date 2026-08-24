<script setup lang="ts">
import { Product } from '@/domain/entities/Product'
import { useWishlist } from '@/presentation/composables/useWishlist'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import { ItemConditionLabel } from '@/domain/enums/ItemCondition'
import {
  IconHeartWishlist,
  IconLocation,
  IconStar,
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
  <div class="card-hover bg-theme-card rounded-3xl border border-theme-border p-3.5 sm:p-4 flex flex-col justify-between group overflow-hidden shadow-card">
    <!-- Image Container with Anti-Camouflage Scrim -->
    <div>
      <div class="relative bg-stone-100 dark:bg-stone-900 rounded-2xl aspect-square overflow-hidden mb-3.5 border border-stone-200/80 dark:border-stone-800">
        <img
          :src="product.primaryImage"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          loading="lazy"
        />

        <!-- Subtle Ambient Vignette / Scrim (Guarantees Badge Contrast on Pure White & Pure Dark Photos) -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-[1]"></div>

        <!-- Top Left Badges (Guaranteed Contrast on Light & Dark Photos) -->
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

        <!-- Wishlist Button with Solid Contrast -->
        <button
          @click.stop="toggleWishlist(product.id)"
          class="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white text-stone-800 border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.30)] flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
          aria-label="Simpan Favorit"
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
          @click="emit('select-product', product)"
          class="font-bold text-sm sm:text-base text-theme-primary line-clamp-2 hover:text-forest dark:hover:text-forest-glow transition-colors cursor-pointer"
        >
          {{ product.name }}
        </h3>
        <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 font-normal">{{ product.description }}</p>
      </div>
    </div>

    <!-- Pricing & Action -->
    <div class="pt-4 mt-4 border-t border-theme-border">
      <div class="flex items-baseline justify-between mb-3">
        <div>
          <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Tarif Sewa</span>
          <p class="font-extrabold text-sm sm:text-base text-forest dark:text-forest-glow">
            {{ product.dailyRate.format() }}<span class="text-xs font-normal text-stone-500 dark:text-stone-400">/hari</span>
          </p>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Deposit Jaminan</span>
          <p class="text-xs font-extrabold text-theme-primary">{{ product.depositAmount.format() }}</p>
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
