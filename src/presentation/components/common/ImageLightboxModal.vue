<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useImageLightbox } from '@/presentation/composables/useImageLightbox'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import {
  IconClose,
  IconChevronLeft,
  IconChevronRight,
} from '@/presentation/components/icons'

const {
  isLightboxOpen,
  lightboxImages,
  activeLightboxIndex,
  lightboxTitle,
  closeLightbox,
  prevImage,
  nextImage,
} = useImageLightbox()

useBodyScrollLock(isLightboxOpen)

function handleKeyDown(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[70] flex flex-col items-center justify-between p-4 sm:p-6 bg-black/92 backdrop-blur-xl select-none"
      >
        <!-- Top Bar: Title, Pagination, Close Button -->
        <div class="w-full max-w-5xl flex items-center justify-between z-10 pt-2 pb-4">
          <div class="text-white">
            <h3 class="font-bold text-sm sm:text-base truncate max-w-md">{{ lightboxTitle || 'Preview Foto Unit' }}</h3>
            <p v-if="lightboxImages.length > 1" class="text-xs text-stone-400">
              Foto {{ activeLightboxIndex + 1 }} dari {{ lightboxImages.length }}
            </p>
          </div>

          <button
            @click="closeLightbox"
            class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 cursor-pointer"
            aria-label="Tutup Preview"
            title="Tutup (Esc)"
          >
            <IconClose :size="18" />
          </button>
        </div>

        <!-- Middle: Main Full Image with Prev/Next Controls -->
        <div class="relative flex-1 w-full max-w-5xl flex items-center justify-center min-h-0 py-2">
          <!-- Prev Button -->
          <button
            v-if="lightboxImages.length > 1"
            @click.stop="prevImage"
            class="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xl backdrop-blur-md"
            aria-label="Foto Sebelumnya"
            title="Sebelumnya (←)"
          >
            <IconChevronLeft :size="22" />
          </button>

          <!-- The Full-Screen Image -->
          <div class="relative max-h-[78vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10">
            <img
              :src="lightboxImages[activeLightboxIndex]"
              :alt="lightboxTitle"
              class="max-h-[78vh] max-w-full w-auto h-auto object-contain rounded-2xl transition-all duration-300"
            />
          </div>

          <!-- Next Button -->
          <button
            v-if="lightboxImages.length > 1"
            @click.stop="nextImage"
            class="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xl backdrop-blur-md"
            aria-label="Foto Selanjutnya"
            title="Selanjutnya (→)"
          >
            <IconChevronRight :size="22" />
          </button>
        </div>

        <!-- Bottom Thumbnails Strip -->
        <div v-if="lightboxImages.length > 1" class="w-full max-w-lg flex items-center justify-center gap-2 pt-3 pb-2 overflow-x-auto z-10 custom-scrollbar">
          <button
            v-for="(img, idx) in lightboxImages"
            :key="idx"
            @click="activeLightboxIndex = idx"
            :class="[
              'w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-900 shrink-0',
              activeLightboxIndex === idx
                ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                : 'border-white/20 opacity-50 hover:opacity-100',
            ]"
          >
            <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
