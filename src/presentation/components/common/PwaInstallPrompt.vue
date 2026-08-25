<script setup lang="ts">
import { ref } from 'vue'
import { usePwa } from '@/presentation/composables/usePwa'
import { IconClose, IconDownload, IconCheck, IconArrowRight } from '@/presentation/components/icons'

const {
  isInstallable,
  isInstalled,
  isStandalone,
  isIos,
  isIosSafari,
  showIosGuide,
  isInstallBannerDismissed,
  installApp,
  dismissInstallPrompt,
} = usePwa()

const showOpenInAppBanner = ref(true)

async function handleInstallClick() {
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
                <span v-if="isIos">Install di iPhone / iPad untuk akses sewa instan & offline.</span>
                <span v-else>Install aplikasi untuk akses sewa instan, hemat kuota & offline.</span>
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

        <!-- 3 Feature Bullets (Non-iOS or collapsed) -->
        <div v-if="!showIosGuide" class="grid grid-cols-3 gap-2 text-[10px] text-stone-600 dark:text-stone-300 border-y border-theme-border py-2">
          <div class="flex items-center gap-1 truncate">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span class="truncate">{{ isIos ? 'Tanpa App Store' : 'Tanpa Play Store' }}</span>
          </div>
          <div class="flex items-center gap-1 truncate">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span class="truncate">Ukuran < 1 MB</span>
          </div>
          <div class="flex items-center gap-1 truncate">
            <IconCheck :size="11" class="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span class="truncate">Bebas Iklan</span>
          </div>
        </div>

        <!-- Special iOS Safari Step-by-Step Instruction Card -->
        <div
          v-if="showIosGuide"
          class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 space-y-2.5 text-xs animate-fade-in"
        >
          <p class="font-bold text-theme-primary text-[11px] flex items-center gap-1.5">
            <span>Petunjuk Install di Safari iOS:</span>
          </p>
          
          <div class="space-y-2 text-[11px] text-stone-700 dark:text-stone-300 font-medium">
            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-[#244E33] text-white flex items-center justify-center text-[10px] font-black shrink-0">1</span>
              <span>
                Ketuk tombol <strong>Bagikan / Share</strong>
                <svg class="inline-block w-4 h-4 ml-1 text-emerald-600 dark:text-emerald-400 align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                di bilah bawah Safari.
              </span>
            </div>

            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-[#244E33] text-white flex items-center justify-center text-[10px] font-black shrink-0">2</span>
              <span>
                Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
              </span>
            </div>

            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-[#244E33] text-white flex items-center justify-center text-[10px] font-black shrink-0">3</span>
              <span>
                Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas layar Anda.
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            @click="handleInstallClick"
            class="flex-1 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <IconDownload :size="14" />
            <span>{{ isIos ? (showIosGuide ? 'Tutup Petunjuk' : 'Cara Install di iOS') : 'Install Sekarang' }}</span>
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

  <!-- Floating Smart "Buka di Aplikasi" Bar for Users Who Installed PWA but Access via Browser -->
  <Transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="isInstalled && !isStandalone && showOpenInAppBanner"
      class="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-fade-in"
    >
      <div
        class="bg-[#244E33] dark:bg-stone-900 text-white border border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-white/10 p-0.5 shrink-0 flex items-center justify-center">
            <img src="/pwa-192x192.png" alt="App Icon" class="w-full h-full object-contain rounded-lg" />
          </div>
          <div class="min-w-0">
            <p class="font-bold text-xs truncate">e-punyasewa App Terpasang</p>
            <p class="text-[10px] text-stone-300 dark:text-stone-400 truncate">Buka di aplikasi untuk akses instan</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <a
            :href="'/'"
            class="px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-black transition cursor-pointer shadow-xs inline-flex items-center gap-1"
          >
            <span>Buka App</span>
            <IconArrowRight :size="11" />
          </a>
          <button
            type="button"
            @click="showOpenInAppBanner = false"
            class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <IconClose :size="10" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
