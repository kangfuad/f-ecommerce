<script setup lang="ts">
import { usePwa } from '@/presentation/composables/usePwa'
import { IconShieldCheck, IconClose, IconDownload, IconCheck } from '@/presentation/components/icons'

const { isInstallable, isInstalled, isInstallBannerDismissed, installApp, dismissInstallPrompt } = usePwa()

async function handleInstall() {
  await installApp()
}
</script>

<template>
  <!-- Only render when installable, not already installed, and not dismissed -->
  <Transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isInstallable && !isInstalled && !isInstallBannerDismissed"
      class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40"
    >
      <div
        class="bg-theme-card/95 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-forest/20 space-y-3.5"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest to-stone-900 border border-emerald-500/30 text-white flex items-center justify-center shrink-0 shadow-md p-1"
            >
              <img src="/pwa-192x192.png" alt="e-punyasewa App Icon" class="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-display font-black text-sm text-theme-primary">e-punyasewa App</h4>
                <span class="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-black border border-emerald-500/30">
                  PWA
                </span>
              </div>
              <p class="text-[11px] text-stone-600 dark:text-stone-300 leading-tight mt-0.5">
                Akses cepat, hemat kuota & buka tanpa internet.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="dismissInstallPrompt"
            class="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Tutup banner"
          >
            <IconClose :size="12" />
          </button>
        </div>

        <!-- 3 Feature Bullets -->
        <div class="grid grid-cols-3 gap-2 text-[10px] text-stone-600 dark:text-stone-300 border-y border-theme-border py-2">
          <div class="flex items-center gap-1">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tanpa Playstore</span>
          </div>
          <div class="flex items-center gap-1">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Ukuran < 1 MB</span>
          </div>
          <div class="flex items-center gap-1">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Bebas Iklan</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            @click="handleInstall"
            class="flex-1 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <IconDownload :size="14" />
            <span>Install Sekarang</span>
          </button>

          <button
            type="button"
            @click="dismissInstallPrompt"
            class="py-2.5 px-3 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
