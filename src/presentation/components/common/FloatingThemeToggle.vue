<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '@/presentation/composables/useTheme'
import {
  IconThemeSun,
  IconThemeMoon,
  IconThemeMonitor,
  IconCheck,
} from '@/presentation/components/icons'

const { currentPreference, resolvedTheme, toggleTheme, applyTheme } = useTheme()

const isExpanded = ref(false)
const showTooltip = ref(false)

const currentLabel = computed(() => {
  if (currentPreference.value === 'light') return 'Mode Terang'
  if (currentPreference.value === 'dark') return 'Mode Gelap'
  return `Sistem (${resolvedTheme.value === 'dark' ? 'Gelap' : 'Terang'})`
})

function handleClick() {
  toggleTheme()
}

function handleSelect(theme: 'light' | 'dark' | 'system') {
  applyTheme(theme)
  isExpanded.value = false
}
</script>

<template>
  <!-- Floating iOS AssistiveTouch-style Theme Switcher -->
  <div
    class="fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-50 flex items-center select-none"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- Tooltip Label on Hover -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-2"
    >
      <div
        v-if="showTooltip && !isExpanded"
        class="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-2xl bg-stone-900/90 dark:bg-stone-800/95 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold shadow-2xl pointer-events-none"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="whitespace-nowrap">{{ currentLabel }}</span>
        <span class="text-[10px] text-stone-400 font-normal">| Ganti</span>
      </div>
    </transition>

    <!-- Expanded Menu Options (Accessible on Long Click or Context Menu) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-90 translate-x-4"
      enter-to-class="opacity-100 scale-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-x-0"
      leave-to-class="opacity-0 scale-90 translate-x-4"
    >
      <div
        v-if="isExpanded"
        class="absolute right-14 sm:right-16 bottom-0 w-44 bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-2 shadow-2xl text-white space-y-1 animate-fade-up"
      >
        <div class="px-3 py-1.5 text-[10px] uppercase font-black text-stone-400 tracking-wider border-b border-white/10 mb-1">
          Pilih Tampilan
        </div>
        <button
          @click="handleSelect('light')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer',
            currentPreference === 'light' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/10 text-stone-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <IconThemeSun :size="15" class="text-amber-400" />
            <span>Terang</span>
          </div>
          <IconCheck v-if="currentPreference === 'light'" :size="14" class="text-amber-400" />
        </button>

        <button
          @click="handleSelect('dark')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer',
            currentPreference === 'dark' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'hover:bg-white/10 text-stone-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <IconThemeMoon :size="15" class="text-indigo-400" />
            <span>Gelap</span>
          </div>
          <IconCheck v-if="currentPreference === 'dark'" :size="14" class="text-indigo-400" />
        </button>

        <button
          @click="handleSelect('system')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer',
            currentPreference === 'system' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-white/10 text-stone-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <IconThemeMonitor :size="15" class="text-emerald-400" />
            <span>Sistem Otomatis</span>
          </div>
          <IconCheck v-if="currentPreference === 'system'" :size="14" class="text-emerald-400" />
        </button>
      </div>
    </transition>

    <!-- Main Capacitive AssistiveTouch Button -->
    <button
      @click="handleClick"
      @contextmenu.prevent="isExpanded = !isExpanded"
      class="group relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-stone-900/85 dark:bg-stone-800/90 backdrop-blur-2xl border border-white/25 dark:border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.35)] flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 hover:border-emerald-400/60 focus:outline-none opacity-85 hover:opacity-100"
      :aria-label="`Ubah Tema: ${currentLabel}`"
      :title="`Mode Tampilan: ${currentLabel} (Klik untuk ganti)`"
    >
      <!-- Outer Assistive Ring Glow -->
      <span class="absolute inset-0.5 rounded-full border border-white/20 pointer-events-none group-hover:border-emerald-400/40 transition-colors"></span>
      
      <!-- Inner Capacitive Core -->
      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 dark:bg-white/5 border border-white/25 flex items-center justify-center group-hover:bg-white/20 transition-all shadow-inner">
        <!-- Sun for Light -->
        <IconThemeSun
          v-if="currentPreference === 'light'"
          :size="18"
          class="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-fade-in"
        />
        <!-- Moon for Dark -->
        <IconThemeMoon
          v-else-if="currentPreference === 'dark'"
          :size="18"
          class="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-fade-in"
        />
        <!-- Monitor for System -->
        <IconThemeMonitor
          v-else
          :size="18"
          class="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-fade-in"
        />
      </div>

      <!-- Tiny Indicator Dot -->
      <span
        :class="[
          'absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-stone-900 transition-colors shadow-xs',
          currentPreference === 'light' ? 'bg-amber-400' : currentPreference === 'dark' ? 'bg-indigo-400' : 'bg-emerald-400'
        ]"
      ></span>
    </button>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
