<script setup lang="ts">
import { useRouter } from 'vue-router'
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
  selectedCategory?: ProductCategory
}

defineProps<Props>()

const router = useRouter()

const emit = defineEmits<{
  (e: 'select-category', category: ProductCategory): void
}>()

function handleCategoryClick(id: ProductCategory) {
  emit('select-category', id)
  router.push({
    path: '/katalog',
    query: id !== ProductCategory.ALL ? { category: id } : {},
  }).catch(() => {})
}

function handleViewAll() {
  emit('select-category', ProductCategory.ALL)
  router.push('/katalog').catch(() => {})
}

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
  <section id="kategori" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-24 md:scroll-mt-28">
    <div class="flex items-end justify-between mb-8">
      <div>
        <span class="text-xs uppercase font-extrabold tracking-widest text-forest dark:text-forest-glow">Kategori Pilihan</span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-theme-primary mt-1">
          Jelajahi Berdasarkan Kebutuhan
        </h2>
      </div>
      <button
        @click="handleViewAll"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-forest-glow hover:underline border-b border-forest dark:border-forest-glow pb-0.5 cursor-pointer"
      >
        <span>Lihat Semua Unit</span>
        <IconArrowRight :size="14" />
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <button
        v-for="cat in CATEGORIES_DATA"
        :key="cat.id"
        @click="handleCategoryClick(cat.id)"
        :class="[
          'relative text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col justify-between min-h-[125px] sm:min-h-[135px] lg:min-h-[145px]',
          selectedCategory === cat.id
            ? 'border-forest dark:border-forest-glow bg-forest/10 dark:bg-stone-800/90 shadow-lg ring-2 ring-forest/30'
            : 'border-theme-border bg-theme-card hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-card'
        ]"
      >
        <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-theme-border flex items-center justify-center text-forest dark:text-forest-glow group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all">
          <component :is="getCategoryIcon(cat.id)" :size="20" />
        </div>

        <div>
          <p :class="['font-bold text-xs sm:text-sm transition-colors', selectedCategory === cat.id ? 'text-forest dark:text-forest-glow font-extrabold' : 'text-theme-primary']">
            {{ cat.name }}
          </p>
          <p class="text-[10px] text-stone-500 mt-0.5">{{ cat.itemCount }}+ Unit</p>
        </div>
      </button>
    </div>
  </section>
</template>
