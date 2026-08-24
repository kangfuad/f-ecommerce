<script setup lang="ts">
import { useCart } from '@/presentation/composables/useCart'
import { IconCheck, IconClose, IconCartBag } from '@/presentation/components/icons'

const { cartToast, dismissToast, openCart } = useCart()
</script>

<template>
  <Teleport to="body">
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
          <div class="w-8 h-8 rounded-full bg-forest dark:bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
            <IconCheck :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate">{{ cartToast.productName }}</p>
            <p class="text-[11px] text-stone-300">{{ cartToast.message }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="() => { dismissToast(); openCart(); }"
            class="text-xs font-extrabold text-forest-soft hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            Lihat
          </button>
          <button
            @click="dismissToast"
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
