import { ref } from 'vue'

const isLightboxOpen = ref(false)
const lightboxImages = ref<string[]>([])
const activeLightboxIndex = ref(0)
const lightboxTitle = ref('')

export function useImageLightbox() {
  function openLightbox(images: string[] | string, title: string = '', startIndex: number = 0) {
    if (Array.isArray(images)) {
      lightboxImages.value = images
    } else {
      lightboxImages.value = [images]
    }
    activeLightboxIndex.value = Math.max(0, Math.min(startIndex, lightboxImages.value.length - 1))
    lightboxTitle.value = title
    isLightboxOpen.value = true
  }

  function closeLightbox() {
    isLightboxOpen.value = false
  }

  function prevImage() {
    if (lightboxImages.value.length <= 1) return
    if (activeLightboxIndex.value > 0) {
      activeLightboxIndex.value--
    } else {
      activeLightboxIndex.value = lightboxImages.value.length - 1
    }
  }

  function nextImage() {
    if (lightboxImages.value.length <= 1) return
    if (activeLightboxIndex.value < lightboxImages.value.length - 1) {
      activeLightboxIndex.value++
    } else {
      activeLightboxIndex.value = 0
    }
  }

  return {
    isLightboxOpen,
    lightboxImages,
    activeLightboxIndex,
    lightboxTitle,
    openLightbox,
    closeLightbox,
    prevImage,
    nextImage,
  }
}
