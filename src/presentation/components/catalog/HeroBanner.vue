<script setup lang="ts">
import BaseButton from '../common/BaseButton.vue'
import BaseBadge from '../common/BaseBadge.vue'

const emit = defineEmits<{
  (e: 'explore'): void
}>()
</script>

<template>
  <section class="relative bg-slate-900 dark:bg-deep-charcoal text-white overflow-hidden py-14 md:py-24 border-b border-slate-800 dark:border-theme-border transition-colors duration-300">
    <!-- Abstract ambient glow -->
    <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sage/15 dark:bg-sage-soft/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-dusty-blue/15 dark:bg-dusty-blue/10 blur-3xl pointer-events-none"></div>

    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid lg:grid-cols-12 gap-12 items-center">
        <!-- Left: Copy & CTA -->
        <div class="lg:col-span-7 space-y-6">
          <div class="flex items-center gap-2">
            <BaseBadge variant="blue" size="md">
              ✨ Premium Gear Rental 2026
            </BaseBadge>
            <span class="text-xs text-slate-300 dark:text-ash-gray font-medium">Bebas Ribet • Jaminan 100% Original</span>
          </div>

          <div class="space-y-2">
            <span class="text-xs tracking-[0.2em] font-extrabold uppercase text-sage-soft dark:text-sage-soft block">
              e-punyasewa platform
            </span>
            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              ELEVATE YOUR<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sage-soft to-dusty-blue">
                EXPERIENCE.
              </span>
            </h1>
          </div>

          <p class="text-slate-300 dark:text-ash-gray text-base sm:text-lg leading-relaxed max-w-2xl font-light">
            Kamera sinematik, drone pro, peralatan camping gunung, hingga gadget flagship. Nikmati kebebasan berkarya tanpa beban biaya beli unit baru.
          </p>

          <!-- Action buttons -->
          <div class="flex flex-wrap gap-4 pt-2">
            <BaseButton @click="emit('explore')" variant="primary" size="lg">
              <span>Sewa Sekarang</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </BaseButton>

            <a href="#kategori" class="inline-flex items-center justify-center font-bold rounded-full px-8 py-4 text-base gap-2 border border-slate-700 dark:border-theme-border hover:border-slate-500 text-white bg-slate-800/60 dark:bg-slate-card hover:bg-slate-800 transition-colors">
              <span>Lihat Kategori</span>
            </a>
          </div>

          <!-- Social Proof / Trust stats -->
          <div class="pt-6 border-t border-slate-800 dark:border-theme-border flex flex-wrap items-center gap-8 text-slate-300 dark:text-ash-gray text-xs sm:text-sm">
            <div>
              <p class="text-xl sm:text-2xl font-extrabold text-white">12.500+</p>
              <p class="text-slate-400 dark:text-ash-gray text-xs">Transaksi Sewa Sukses</p>
            </div>
            <div class="h-8 w-px bg-slate-800 dark:bg-theme-border"></div>
            <div>
              <p class="text-xl sm:text-2xl font-extrabold text-white">4.9 / 5.0</p>
              <p class="text-slate-400 dark:text-ash-gray text-xs">Rating Pelanggan Puas</p>
            </div>
            <div class="h-8 w-px bg-slate-800 dark:bg-theme-border"></div>
            <div>
              <p class="text-xl sm:text-2xl font-extrabold text-white">100%</p>
              <p class="text-slate-400 dark:text-ash-gray text-xs">Deposit Kembali Aman</p>
            </div>
          </div>
        </div>

        <!-- Right: Visual Hero Card -->
        <div class="lg:col-span-5 relative">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 dark:border-theme-border bg-slate-800/80 dark:bg-slate-card group">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
              alt="Sony A7 IV Rental Unit"
              class="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 dark:from-deep-charcoal via-transparent to-transparent"></div>

            <!-- Floating rental quick card -->
            <div class="absolute bottom-5 left-5 right-5 bg-slate-900/90 dark:bg-slate-card/95 backdrop-blur-md border border-slate-700/80 dark:border-theme-border rounded-2xl p-4 text-white shadow-xl">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 dark:text-sage-soft bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    Unit Terpopuler
                  </span>
                  <p class="font-bold text-base mt-1 text-white">Sony Alpha 7 IV Kit</p>
                  <p class="text-xs text-slate-300 dark:text-ash-gray">Siap pakai lengkap lensa GM & memory</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-slate-400">Mulai dari</p>
                  <p class="text-base font-extrabold text-emerald-400 dark:text-sage-soft">Rp 350.000<span class="text-xs font-normal text-slate-300">/hari</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
