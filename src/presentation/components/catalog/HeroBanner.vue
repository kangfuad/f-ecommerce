<script setup lang="ts">
import { computed } from 'vue'
import { Product } from '@/domain/entities/Product'
import BaseButton from '../common/BaseButton.vue'
import { IconArrowRight } from '@/presentation/components/icons'

interface Props {
  featuredProduct?: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'explore'): void
  (e: 'select-featured', product: Product): void
}>()

const displayImage = computed(() => {
  return props.featuredProduct?.primaryImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'
})

const displayName = computed(() => {
  return props.featuredProduct?.name || 'Unit Perlengkapan Sewa Pilihan'
})

const displayDescription = computed(() => {
  return props.featuredProduct?.description || 'Siap pakai langsung untuk kebutuhan produksi & hobi kreatif Anda.'
})

const displayBadge = computed(() => {
  if (props.featuredProduct?.badgeText) return props.featuredProduct.badgeText
  if (props.featuredProduct?.isPopular) return 'Unit Terpopuler'
  if (props.featuredProduct?.isFeatured) return 'Unit Pilihan'
  return 'Unit Rekomendasi'
})

const displayRate = computed(() => {
  return props.featuredProduct ? props.featuredProduct.dailyRate.format() : 'Rp 350.000'
})

function handleCardClick() {
  if (props.featuredProduct) {
    emit('select-featured', props.featuredProduct)
  }
}
</script>

<template>
  <section class="relative bg-[#1C1917] dark:bg-[#141211] text-white overflow-hidden py-10 sm:py-14 lg:py-16 xl:py-24 border-b border-stone-800 dark:border-stone-800/80 transition-colors duration-300">
    <!-- Abstract ambient glow (Organic Warm & Sage) -->
    <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-forest-glow/15 dark:bg-forest-glow/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-terracotta/15 dark:bg-terracotta/10 blur-3xl pointer-events-none"></div>

    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
        <!-- Left: Copy & CTA -->
        <div class="lg:col-span-7 space-y-4 sm:space-y-6">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 font-black uppercase tracking-wider rounded-full bg-[#244E33]/70 text-[#A3C4AF] border border-[#82A78F]/50 shadow-sm">
              Premium Gear Rental 2026
            </span>
            <span class="text-xs text-stone-300 dark:text-stone-400 font-medium hidden sm:inline">Bebas Ribet • Jaminan 100% Original</span>
          </div>

          <div class="space-y-1.5 sm:space-y-2">
            <span class="text-xs tracking-[0.2em] font-extrabold uppercase text-sage-soft dark:text-sage-soft block">
              e-punyasewa platform
            </span>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-4xl xl:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              ELEVATE YOUR<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#A3C4AF] via-[#82A78F] to-[#E09F67]">
                EXPERIENCE.
              </span>
            </h1>
          </div>

          <p class="text-stone-300 dark:text-stone-400 text-sm sm:text-base lg:text-base xl:text-lg leading-relaxed max-w-2xl font-light">
            Kamera & drone, laptop & gadget, sound system, hingga perlengkapan outdoor & event. Bebas berkarya dan beraktivitas tanpa beban biaya beli unit baru.
          </p>

          <!-- Action buttons -->
          <div class="flex flex-wrap gap-3 sm:gap-4 pt-2">
            <BaseButton @click="emit('explore')" variant="primary" size="lg">
              <span>Eksplorasi Unit Sewa</span>
              <IconArrowRight :size="18" />
            </BaseButton>

            <a href="#kategori" class="inline-flex items-center justify-center font-bold rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base gap-2 border border-stone-700 hover:border-stone-500 text-white bg-stone-800/60 dark:bg-espresso-card hover:bg-stone-800 transition-colors">
              <span>Lihat Kategori</span>
            </a>
          </div>

          <!-- Social Proof / Trust stats -->
          <div class="pt-5 sm:pt-6 border-t border-stone-800 flex flex-wrap items-center gap-5 sm:gap-8 text-stone-300 dark:text-stone-400 text-xs sm:text-sm">
            <div>
              <p class="text-lg sm:text-xl lg:text-2xl font-extrabold text-white">12.500+</p>
              <p class="text-stone-400 text-[11px] sm:text-xs">Reservasi Booking Sukses</p>
            </div>
            <div class="h-8 w-px bg-stone-800"></div>
            <div>
              <p class="text-lg sm:text-xl lg:text-2xl font-extrabold text-white">4.9 / 5.0</p>
              <p class="text-stone-400 text-[11px] sm:text-xs">Skor Reputasi Komunitas</p>
            </div>
            <div class="h-8 w-px bg-stone-800"></div>
            <div>
              <p class="text-lg sm:text-xl lg:text-2xl font-extrabold text-white">100%</p>
              <p class="text-stone-400 text-[11px] sm:text-xs">Transaksi Langsung Aman</p>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Visual Hero Card (Dynamic from API) -->
        <div class="lg:col-span-5 relative">
          <div
            @click="handleCardClick"
            class="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-700/80 hover:border-forest-soft/80 dark:border-stone-700 hover:ring-2 hover:ring-forest-soft/40 bg-stone-800/80 dark:bg-espresso-card group cursor-pointer transition-all duration-500 hover:scale-[1.01]"
            title="Klik untuk lihat detail & kalkulasi sewa unit ini"
          >
            <img
              :src="displayImage"
              :alt="displayName"
              class="w-full h-72 sm:h-80 lg:h-80 xl:h-96 object-cover group-hover:scale-108 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#141211]/90 via-transparent to-black/20"></div>

            <!-- Interactive Click-Hint Pill -->
            <div class="absolute top-3.5 right-3.5 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 group-hover:bg-forest group-hover:border-forest-soft transition-all flex items-center gap-1.5 shadow-lg">
              <span>Detail Unit</span>
              <IconArrowRight :size="12" class="group-hover:translate-x-0.5 transition-transform" />
            </div>

            <!-- Floating rental quick card -->
            <div class="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 bg-[#1C1917]/90 dark:bg-espresso-card/95 backdrop-blur-md border border-stone-700/80 group-hover:border-forest-soft/50 rounded-2xl p-3.5 sm:p-4 text-white shadow-xl transition-all">
              <div class="flex items-start justify-between gap-2 sm:gap-3">
                <div class="min-w-0 flex-1">
                  <span class="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-[#A3C4AF] bg-[#244E33]/90 px-2 py-0.5 rounded border border-emerald-500/40">
                    {{ displayBadge }}
                  </span>
                  <p class="font-bold text-sm sm:text-base mt-1 text-white group-hover:text-forest-soft transition-colors truncate">
                    {{ displayName }}
                  </p>
                  <p class="text-[11px] sm:text-xs text-stone-300 dark:text-stone-400 line-clamp-1">
                    {{ displayDescription }}
                  </p>
                </div>
                <div class="text-right shrink-0 ml-2">
                  <p class="text-[9px] sm:text-[10px] text-stone-400">Mulai dari</p>
                  <p class="text-sm sm:text-base font-extrabold text-forest-soft">
                    {{ displayRate }}<span class="text-[10px] sm:text-xs font-normal text-stone-300">/hari</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
