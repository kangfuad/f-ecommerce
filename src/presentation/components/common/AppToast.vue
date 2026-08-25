<script setup lang="ts">
import { useToast } from '@/presentation/composables/useToast'
import { useCart } from '@/presentation/composables/useCart'
import { IconCheck, IconClose, IconCartBag, IconShieldCheck } from '@/presentation/components/icons'

const { activeToast, dismissToast: dismissGlobalToast } = useToast()
const { cartToast, dismissToast: dismissCartToast, openCart } = useCart()
</script>

<template>
  <Teleport to="body">
    <!-- Global Multi-Type Toast (Warning, Error, Success) -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="activeToast"
        class="fixed top-20 right-4 sm:right-6 z-[80] max-w-sm w-full backdrop-blur-md rounded-2xl p-4 shadow-2xl border flex items-start justify-between gap-3 text-xs"
        :class="[
          activeToast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-950/40'
            : activeToast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-950/40'
              : 'bg-stone-900/95 border-emerald-500/40 text-white shadow-black/40'
        ]"
      >
        <div class="flex items-start gap-2.5 min-w-0">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm font-black mt-0.5"
            :class="[
              activeToast.type === 'warning'
                ? 'bg-amber-500 text-stone-950'
                : activeToast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white'
            ]"
          >
            <span v-if="activeToast.type === 'warning'">!</span>
            <IconClose v-else-if="activeToast.type === 'error'" :size="14" />
            <IconCheck v-else :size="14" class="stroke-[3]" />
          </div>

          <div class="min-w-0 flex-1">
            <p v-if="activeToast.title" class="font-extrabold text-xs mb-0.5" :class="activeToast.type === 'warning' ? 'text-amber-300' : 'text-white'">
              {{ activeToast.title }}
            </p>
            <p class="text-[11px] leading-relaxed" :class="activeToast.type === 'warning' ? 'text-amber-200/90' : 'text-stone-300'">
              {{ activeToast.message }}
            </p>
          </div>
        </div>

        <button
          @click="dismissGlobalToast"
          class="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0"
          aria-label="Tutup"
        >
          <IconClose :size="14" />
        </button>
      </div>
    </transition>

    <!-- Cart Mini Toast (Bottom Right) -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="cartToast"
        class="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-stone-900/95 dark:bg-stone-900/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-stone-700/60 flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-full bg-[#244E33] dark:bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
            <IconCheck :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate">{{ cartToast.productName }}</p>
            <p class="text-[11px] text-stone-300">{{ cartToast.message }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="() => { dismissCartToast(); openCart(); }"
            class="text-xs font-extrabold text-emerald-400 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            Lihat
          </button>
          <button
            @click="dismissCartToast"
            class="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Tutup Notifikasi"
          >
            <IconClose :size="14" />
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
