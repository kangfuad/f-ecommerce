<script setup lang="ts">
import { ref, computed } from 'vue'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { useToast } from '@/presentation/composables/useToast'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { IconClose, IconStar, IconCheck } from '@/presentation/components/icons'

interface Props {
  order: OrderDto | null
  reviewRole: 'TENANT' | 'PROVIDER'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', updatedOrder: OrderDto): void
}>()

useBodyScrollLock(() => !!props.order)

const { showToast } = useToast()
const overallRating = ref(5)
const hoverRating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)

const tenantAspects = ref([
  { aspect: 'Kondisi Fisik & Fungsi Unit', score: 5 },
  { aspect: 'Ketepatan Waktu & Layanan', score: 5 },
  { aspect: 'Kemudahan Serah Terima', score: 5 },
])

const providerAspects = ref([
  { aspect: 'Kerapian & Perawatan Unit', score: 5 },
  { aspect: 'Ketepatan Pengembalian', score: 5 },
  { aspect: 'Komunikasi & Pembayaran', score: 5 },
])

const activeAspects = computed(() => {
  return props.reviewRole === 'TENANT' ? tenantAspects.value : providerAspects.value
})

const targetName = computed(() => {
  if (!props.order) return ''
  return props.reviewRole === 'TENANT'
    ? props.order.provider?.name || 'Penyedia Sewa'
    : props.order.customer?.fullName || 'Penyewa'
})

async function submitReview() {
  if (!props.order) return
  if (comment.value.trim().length < 5) {
    showToast({
      type: 'error',
      title: 'Ulasan Belum Lengkap',
      message: 'Mohon tuliskan komentar ulasan minimal 5 karakter.',
    })
    return
  }

  isSubmitting.value = true

  try {
    const authorName = props.reviewRole === 'TENANT'
      ? props.order.customer?.fullName || 'Penyewa'
      : props.order.provider?.name || 'Penyedia Sewa'

    let res
    if (props.reviewRole === 'TENANT') {
      res = await OrderService.submitUserReview(props.order.id, {
        authorName,
        targetName: targetName.value,
        overallRating: overallRating.value,
        aspects: activeAspects.value,
        comment: comment.value,
      })
    } else {
      res = await OrderService.submitProviderReview(props.order.id, {
        authorName,
        targetName: targetName.value,
        overallRating: overallRating.value,
        aspects: activeAspects.value,
        comment: comment.value,
      })
    }

    if (res.status === 'success' && res.data) {
      showToast({
        type: 'success',
        title: 'Ulasan Berhasil Dikirim!',
        message: 'Terima kasih atas penilaian yang Anda berikan.',
      })
      emit('submitted', res.data)
      emit('close')
    } else {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim Ulasan',
        message: res.message || 'Terjadi kesalahan sistem.',
      })
    }
  } catch (err: any) {
    showToast({
      type: 'error',
      title: 'Error',
      message: err.message || 'Gagal mengirim ulasan.',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card -->
    <div class="relative bg-theme-card text-theme-primary rounded-3xl max-w-lg w-full shadow-2xl border border-theme-border z-10 animate-fade-up p-5 sm:p-7 space-y-5">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-forest dark:text-forest-glow">
            {{ reviewRole === 'TENANT' ? 'Penilaian untuk Penyedia' : 'Penilaian Reputasi Penyewa' }}
          </span>
          <h3 class="font-extrabold text-base text-theme-primary">
            {{ reviewRole === 'TENANT' ? `Beri Ulasan ${targetName}` : `Nilai Kredibilitas ${targetName}` }}
          </h3>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-theme-primary flex items-center justify-center transition cursor-pointer"
        >
          <IconClose :size="14" />
        </button>
      </div>

      <!-- Star Rating Selector -->
      <div class="text-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border space-y-2">
        <p class="text-xs font-bold text-stone-600 dark:text-stone-300">Skor Penilaian Keseluruhan</p>
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            @click="overallRating = star"
            class="p-1 text-2xl transition transform hover:scale-125 cursor-pointer text-amber-500"
          >
            <svg
              class="w-7 h-7 fill-current"
              :class="star <= (hoverRating || overallRating) ? 'text-amber-500' : 'text-stone-300 dark:text-stone-700'"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        </div>
        <p class="text-[11px] font-extrabold text-forest dark:text-forest-glow">
          {{ overallRating }} dari 5 Bintang
        </p>
      </div>

      <!-- Aspect Rating Sliders -->
      <div class="space-y-3">
        <span class="text-xs font-bold text-stone-600 dark:text-stone-300 block">Kriteria Penilaian:</span>
        <div v-for="(item, idx) in activeAspects" :key="idx" class="flex items-center justify-between gap-3 text-xs">
          <span class="text-stone-600 dark:text-stone-400 text-[11px] flex-1">{{ item.aspect }}</span>
          <div class="flex items-center gap-1">
            <button
              v-for="val in 5"
              :key="val"
              type="button"
              @click="item.score = val"
              :class="[
                'w-6 h-6 rounded-lg text-[10px] font-bold transition cursor-pointer',
                item.score === val
                  ? 'bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 font-black'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
              ]"
            >
              {{ val }}
            </button>
          </div>
        </div>
      </div>

      <!-- Comments Input -->
      <div>
        <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
          Tulis Komentar & Ulasan Pengalaman:
        </label>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Ceritakan pengalaman serah terima, kondisi unit, atau ketepatan waktu..."
          class="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-theme-border">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          Batal
        </button>

        <button
          type="button"
          @click="submitReview"
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <IconCheck :size="13" />
          <span>{{ isSubmitting ? 'Mengirim...' : 'Kirim Penilaian' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
