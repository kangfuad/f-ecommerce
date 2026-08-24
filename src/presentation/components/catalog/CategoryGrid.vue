<script setup lang="ts">
import { ProductCategory, CATEGORIES_DATA } from '@/domain/enums/ProductCategory'

interface Props {
  selectedCategory: ProductCategory
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-category', category: ProductCategory): void
}>()
</script>

<template>
  <section id="kategori" class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="flex items-end justify-between mb-8">
      <div>
        <span class="text-xs uppercase font-extrabold tracking-widest text-sage dark:text-sage-soft">Kategori Pilihan</span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-theme-primary mt-1">
          Jelajahi Berdasarkan Kebutuhan
        </h2>
      </div>
      <button
        @click="emit('select-category', ProductCategory.ALL)"
        class="hidden sm:inline-flex items-center text-xs font-bold text-sage dark:text-sage-soft hover:underline border-b border-sage dark:border-sage-soft pb-0.5 cursor-pointer"
      >
        Lihat Semua Unit →
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <button
        v-for="cat in CATEGORIES_DATA"
        :key="cat.id"
        @click="emit('select-category', cat.id)"
        :class="[
          'relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col justify-between h-36 sm:h-40',
          selectedCategory === cat.id
            ? 'border-sage dark:border-sage-soft bg-sage/10 dark:bg-zinc-800/90 shadow-lg ring-2 ring-sage/30'
            : 'border-theme-border bg-theme-card hover:border-slate-400 dark:hover:border-zinc-500 hover:shadow-card'
        ]"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-theme-border flex items-center justify-center text-theme-muted group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all">
          <svg v-if="cat.id === 'ALL'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <svg v-else-if="cat.id === 'CAMERA'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <svg v-else-if="cat.id === 'DRONE_AUDIO'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-else-if="cat.id === 'OUTDOOR'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 20-7-14-7 14"/><path d="M12 6v14"/><path d="M7 20h10"/></svg>
          <svg v-else-if="cat.id === 'GADGET'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/></svg>
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
