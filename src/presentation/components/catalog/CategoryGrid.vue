<script setup lang="ts">
import { ProductCategory, CATEGORIES_DATA } from '@/domain/enums/ProductCategory'
import {
  IconCategoryAll,
  IconCategoryCamera,
  IconCategoryDrone,
  IconCategoryOutdoor,
  IconCategoryGadget,
  IconCategoryFashion,
  IconArrowRight,
} from '@/presentation/components/icons'

interface Props {
  selectedCategory: ProductCategory
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-category', category: ProductCategory): void
}>()

function getCategoryIcon(id: string) {
  switch (id) {
    case 'CAMERA': return IconCategoryCamera
    case 'DRONE_AUDIO': return IconCategoryDrone
    case 'OUTDOOR': return IconCategoryOutdoor
    case 'GADGET': return IconCategoryGadget
    case 'FASHION_EVENT': return IconCategoryFashion
    default: return IconCategoryAll
  }
}
</script>

<template>
  <section id="kategori" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <div class="flex items-end justify-between mb-8">
      <div>
        <span class="text-xs uppercase font-extrabold tracking-widest text-sage dark:text-sage-soft">Kategori Pilihan</span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-theme-primary mt-1">
          Jelajahi Berdasarkan Kebutuhan
        </h2>
      </div>
      <button
        @click="emit('select-category', ProductCategory.ALL)"
        class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-sage dark:text-sage-soft hover:underline border-b border-sage dark:border-sage-soft pb-0.5 cursor-pointer"
      >
        <span>Lihat Semua Unit</span>
        <IconArrowRight :size="14" />
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <button
        v-for="cat in CATEGORIES_DATA"
        :key="cat.id"
        @click="emit('select-category', cat.id)"
        :class="[
          'relative text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col justify-between min-h-[125px] sm:min-h-[135px] lg:min-h-[145px]',
          selectedCategory === cat.id
            ? 'border-sage dark:border-sage-soft bg-sage/10 dark:bg-zinc-800/90 shadow-lg ring-2 ring-sage/30'
            : 'border-theme-border bg-theme-card hover:border-slate-400 dark:hover:border-zinc-500 hover:shadow-card'
        ]"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-theme-border flex items-center justify-center text-sage dark:text-sage-soft group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all">
          <component :is="getCategoryIcon(cat.id)" :size="20" />
        </div>

        <div>
          <p :class="['font-bold text-xs sm:text-sm transition-colors', selectedCategory === cat.id ? 'text-sage-hover dark:text-sage-soft font-extrabold' : 'text-theme-primary']">
            {{ cat.name }}
          </p>
          <p class="text-[10px] text-theme-muted mt-0.5">{{ cat.itemCount }}+ Unit</p>
        </div>
      </button>
    </div>
  </section>
</template>
