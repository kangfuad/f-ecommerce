<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import {
  IconSearch,
  IconArrowRight,
  IconBoxPackage,
  IconShieldCheck,
  IconDeliveryTruck,
} from '@/presentation/components/icons'

const router = useRouter()

const quickCategories = [
  { name: 'Kamera Sinema', desc: 'Sony FX3, RED Komodo, ARRI', query: 'CAMERA' },
  { name: 'Drone & Audio', desc: 'DJI Inspire 3, Mavic 3 Pro, Mic', query: 'DRONE_AUDIO' },
  { name: 'Lensa & Anamorphic', desc: 'Sirui, Cooke, Zeiss, Canon L', query: 'CAMERA' },
  { name: 'Peralatan Outdoor', desc: 'Tenda Dome, Power Station', query: 'OUTDOOR' },
]

function navigateCategory(category: string) {
  router.push({ path: '/katalog', query: { category } })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-8 animate-fade-up">
      <!-- 404 Badge with Glow -->
      <div class="relative">
        <div class="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-forest via-stone-900 to-stone-950 border border-emerald-500/40 text-emerald-400 flex flex-col items-center justify-center shadow-2xl mx-auto">
          <span class="font-mono font-black text-4xl sm:text-5xl tracking-tight text-white drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]">
            404
          </span>
          <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-400 mt-1">
            Not Found
          </span>
        </div>
      </div>

      <!-- Heading & Description -->
      <div class="space-y-2.5 max-w-lg mx-auto">
        <h1 class="font-display text-2xl sm:text-3xl md:text-4xl font-black text-theme-primary tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke katalog untuk melihat koleksi kamera sinema dan drone kami.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <router-link
          to="/katalog"
          class="w-full sm:w-auto px-6 py-3 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <IconSearch :size="15" />
          <span>Jelajahi Katalog Kamera & Drone</span>
        </router-link>

        <router-link
          to="/"
          class="w-full sm:w-auto px-6 py-3 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer text-center"
        >
          Kembali ke Beranda
        </router-link>
      </div>

      <!-- Quick Category Recommendations -->
      <div class="w-full pt-8 border-t border-theme-border max-w-2xl mx-auto space-y-4">
        <span class="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
          Paling Sering Dicari di e-punyasewa:
        </span>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <button
            type="button"
            v-for="(cat, idx) in quickCategories"
            :key="idx"
            @click="navigateCategory(cat.query)"
            class="p-3.5 rounded-2xl bg-theme-card border border-theme-border hover:border-forest/40 transition shadow-2xs group cursor-pointer"
          >
            <h4 class="font-bold text-xs text-theme-primary group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors">
              {{ cat.name }}
            </h4>
            <p class="text-[10px] text-stone-500 truncate mt-0.5">
              {{ cat.desc }}
            </p>
          </button>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
