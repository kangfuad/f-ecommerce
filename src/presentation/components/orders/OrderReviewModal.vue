<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import { useToast } from '@/presentation/composables/useToast'
import { IconClose, IconStar, IconCheck, IconShieldCheck } from '@/presentation/components/icons'
import BaseButton from '../common/BaseButton.vue'

interface Props {
  order: OrderDto | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-review', data: { orderId: string; rating: number; comment: string; tags: string[] }): void
}>()

const { showToast } = useToast()

const rating = ref(5)
const hoverRating = ref(0)
const comment = ref('')
const selectedTags = ref<string[]>([])
const isSubmitting = ref(false)

const availableTags = [
  'Unit Sangat Bersih & Mulus',
  'Sensor Bebas Debu / Jamur',
  'Baterai Awet Sesuai Spek',
  'Pengantaran Cepat & Aman',
  'Hardcase & Aksesoris Lengkap',
  'CS Ramah & Solutif',
]

const ratingLabels = [
  '',
  'Sangat Mengecewakan',
  'Kurang Memuaskan',
  'Cukup Baik',
  'Sangat Puas',
  'Luar Biasa Sempurna!',
]

const activeRatingLabel = computed(() => {
  const current = hoverRating.value || rating.value
  return ratingLabels[current] || ''
})

function toggleTag(tag: string) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

async function handleSubmit() {
  if (!props.order) return
  if (rating.value < 1) {
    showToast({ type: 'warning', title: 'Pilih Rating', message: 'Silakan pilih minimal 1 bintang rating.' })
    return
  }

  isSubmitting.value = true
  // Simulate submission delay
  await new Promise((resolve) => setTimeout(resolve, 600))
  isSubmitting.value = false

  emit('submit-review', {
    orderId: props.order.id,
    rating: rating.value,
    comment: comment.value.trim(),
    tags: selectedTags.value,
  })

  showToast({
    type: 'success',
    title: 'Ulasan Terkirim!',
    message: 'Terima kasih telah memberikan ulasan dan rating untuk pesanan Anda.',
  })

  emit('close')
}
</script>

<template>
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card Container -->
    <div class="relative bg-theme-card rounded-3xl max-w-lg w-full max-h-[90vh] my-auto overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary p-5 sm:p-7 space-y-5">
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-theme-border pb-4">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-forest dark:text-forest-glow">
            Ulasan Pengalaman Sewa
          </span>
          <h3 class="font-display text-lg sm:text-xl font-black text-theme-primary mt-0.5">
            Beri Penilaian & Ulasan
          </h3>
          <p class="text-xs text-stone-500 mt-0.5">
            Pesanan: <span class="font-mono font-bold text-theme-primary">#{{ order.id }}</span>
          </p>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer shrink-0"
        >
          <IconClose :size="14" />
        </button>
      </div>

      <!-- Gear Being Reviewed -->
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-theme-border text-xs">
        <div class="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 border border-theme-border overflow-hidden shrink-0 flex items-center justify-center p-1">
          <img
            v-if="order.items[0]?.primaryImage"
            :src="order.items[0].primaryImage"
            :alt="order.items[0].productName"
            class="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-extrabold text-theme-primary truncate text-xs sm:text-sm">
            {{ order.items[0]?.productName }}
          </h4>
          <p class="text-[11px] text-stone-500">
            <span v-if="order.items.length > 1">+ {{ order.items.length - 1 }} unit perlengkapan lainnya • </span>
            {{ order.items[0]?.startDate }} s/d {{ order.items[0]?.endDate }}
          </p>
        </div>
      </div>

      <!-- Star Rating Interactive Selector -->
      <div class="text-center space-y-2 py-1">
        <label class="font-bold text-xs text-theme-primary block">Seberapa puas Anda dengan kondisi unit & layanan?</label>
        
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            @click="rating = star"
            class="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
          >
            <IconStar
              :size="28"
              :class="[
                'transition-colors duration-150',
                star <= (hoverRating || rating)
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-stone-300 dark:text-stone-700'
              ]"
            />
          </button>
        </div>

        <p class="text-xs font-black text-amber-600 dark:text-amber-400 h-4">
          {{ activeRatingLabel }}
        </p>
      </div>

      <!-- Quick Feedback Tags -->
      <div class="space-y-2">
        <label class="font-bold text-xs text-theme-primary block">Pilih hal yang paling Anda sukai:</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in availableTags"
            :key="tag"
            type="button"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1',
              selectedTags.includes(tag)
                ? 'bg-forest text-white border-forest shadow-2xs'
                : 'border-theme-border bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:border-forest/40'
            ]"
          >
            <IconCheck v-if="selectedTags.includes(tag)" :size="10" class="stroke-[3]" />
            <span>{{ tag }}</span>
          </button>
        </div>
      </div>

      <!-- Written Review Textarea -->
      <div class="space-y-1.5">
        <label class="font-bold text-xs text-theme-primary block">Tulis ulasan lengkap (opsional):</label>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Ceritakan pengalaman syuting, kondisi sensor, kebersihan unit, atau respon kurir kami..."
          class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-2xl p-3.5 text-xs text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest transition"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 pt-2 border-t border-theme-border">
        <BaseButton
          type="button"
          @click="handleSubmit"
          :loading="isSubmitting"
          variant="primary"
          size="md"
          class="flex-1 font-black cursor-pointer shadow-md"
        >
          <span>Kirim Ulasan</span>
        </BaseButton>

        <button
          type="button"
          @click="emit('close')"
          class="px-5 py-2.5 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>
