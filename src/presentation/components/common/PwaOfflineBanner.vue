<script setup lang="ts">
import { usePwa } from '@/presentation/composables/usePwa'
import { IconShieldCheck } from '@/presentation/components/icons'

const { isOffline } = usePwa()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="isOffline"
      class="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md"
    >
      <span class="w-2 h-2 rounded-full bg-stone-950 animate-ping shrink-0"></span>
      <span>
        Mode Offline: Koneksi terputus. Anda tetap dapat menjelajahi katalog dan data tersimpan dari cache lokal PWA.
      </span>
    </div>
  </Transition>
</template>
