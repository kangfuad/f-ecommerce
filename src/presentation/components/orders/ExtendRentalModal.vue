<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import { IconClose, IconCalendarDate, IconCheck } from '@/presentation/components/icons'

interface Props {
  order: OrderDto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm-extension', orderId: string, additionalDays: number): void
}>()

useBodyScrollLock(() => !!props.order)

const selectedDays = ref<number>(1)
const isSubmitting = ref(false)

const additionalFee = computed(() => {
  if (!props.order) return 0
  let totalDaily = 0
  for (const item of props.order.items) {
    totalDaily += item.dailyRate * item.quantity
  }
  return totalDaily * selectedDays.value
})

async function handleConfirm() {
  if (!props.order) return
  isSubmitting.value = true
  try {
    emit('confirm-extension', props.order.id, selectedDays.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card Container -->
    <div class="relative bg-theme-card rounded-3xl max-w-md w-full shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary p-5 sm:p-6 space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <IconCalendarDate :size="18" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-theme-primary">Perpanjang Masa Sewa</h3>
            <p class="text-xs text-stone-500">ID: {{ order.id }}</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Item Snapshot -->
      <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-theme-border flex items-center gap-3">
        <img
          :src="order.items[0]?.primaryImage"
          :alt="order.items[0]?.productName"
          class="w-14 h-14 rounded-xl object-cover border border-theme-border"
        />
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-theme-primary truncate">{{ order.items[0]?.productName }}</h4>
          <p class="text-[11px] text-stone-500">
            Durasi saat ini: <span class="font-bold text-theme-primary">{{ order.items[0]?.rentalDays }} Hari</span>
          </p>
        </div>
      </div>

      <!-- Choose Extra Days -->
      <div class="space-y-2">
        <label class="block text-xs font-extrabold uppercase tracking-wider text-stone-500">
          Pilih Tambahan Hari Sewa:
        </label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="days in [1, 2, 3, 5]"
            :key="days"
            type="button"
            @click="selectedDays = days"
            :class="[
              'py-2.5 rounded-xl border text-xs font-black transition cursor-pointer text-center',
              selectedDays === days
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'border-theme-border bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:border-forest/40'
            ]"
          >
            +{{ days }} Hari
          </button>
        </div>
      </div>

      <!-- Calculation Breakdown -->
      <div class="p-3.5 rounded-2xl bg-forest/10 border border-forest/25 space-y-1.5 text-xs">
        <div class="flex items-center justify-between text-stone-600 dark:text-stone-400">
          <span>Tarif Tambahan ({{ selectedDays }} Hari):</span>
          <span class="font-bold text-theme-primary">{{ formatRupiah(additionalFee) }}</span>
        </div>
        <div class="flex items-center justify-between text-stone-600 dark:text-stone-400">
          <span>Biaya Deposit Tambahan:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">Rp 0 (Bebas Deposit)</span>
        </div>
        <div class="pt-2 border-t border-forest/20 flex items-center justify-between font-black text-sm text-forest dark:text-forest-glow">
          <span>Total Biaya Tambahan:</span>
          <span>{{ formatRupiah(additionalFee) }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex items-center gap-3">
        <button
          @click="emit('close')"
          class="flex-1 py-2.5 px-4 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer text-center"
        >
          Batal
        </button>
        <button
          @click="handleConfirm"
          :disabled="isSubmitting"
          class="flex-1 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          <IconCheck :size="14" />
          <span>Konfirmasi</span>
        </button>
      </div>
    </div>
  </div>
</template>
