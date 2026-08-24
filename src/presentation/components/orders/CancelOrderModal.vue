<script setup lang="ts">
import { ref } from 'vue'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconClose,
  IconClock,
} from '@/presentation/components/icons'

interface Props {
  order: OrderDto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm-cancel', orderId: string, reason: string): void
}>()

useBodyScrollLock(() => !!props.order)

const selectedReason = ref<string>('Ingin mengubah pilihan unit / durasi sewa')
const customReason = ref<string>('')
const isSubmitting = ref(false)

const reasons = [
  'Ingin mengubah pilihan unit / durasi sewa',
  'Ingin mengganti metode pembayaran',
  'Tidak jadi menyewa saat ini',
  'Alasan lainnya',
]

async function handleConfirm() {
  if (!props.order) return
  isSubmitting.value = true
  try {
    const finalReason = selectedReason.value === 'Alasan lainnya' && customReason.value.trim()
      ? customReason.value.trim()
      : selectedReason.value
    emit('confirm-cancel', props.order.id, finalReason)
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
    <div class="relative bg-theme-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary p-5 sm:p-6 space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div>
          <h3 class="font-extrabold text-base text-theme-primary">Batalkan Tagihan Pembayaran</h3>
          <p class="text-xs text-stone-500">ID Pesanan: {{ order.id }}</p>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Pending Status Info Banner -->
      <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <IconClock :size="20" class="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div class="text-xs space-y-0.5">
          <p class="font-bold text-amber-800 dark:text-amber-300">
            Tagihan Ini Belum Dibayar
          </p>
          <p class="text-stone-600 dark:text-stone-400">
            Pesanan sebesar <strong class="text-theme-primary">{{ formatRupiah(order.pricing.grandTotal) }}</strong> belum diproses pembayarannya. Membatalkan pesanan ini akan menutup invoice dan membatalkan tagihan.
          </p>
        </div>
      </div>

      <!-- Item Snapshot -->
      <div class="space-y-2">
        <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block">Unit Dalam Tagihan:</span>
        <div class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img
                :src="item.primaryImage"
                :alt="item.productName"
                class="w-8 h-8 rounded-lg object-cover border border-theme-border shrink-0"
              />
              <span class="font-bold text-theme-primary truncate">{{ item.productName }}</span>
            </div>
            <span class="font-semibold text-stone-500 shrink-0 ml-2">Qty: {{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Cancellation Reason Selection -->
      <div class="space-y-2">
        <label class="block text-xs font-extrabold uppercase tracking-wider text-stone-500">
          Pilih Alasan Pembatalan Tagihan:
        </label>
        <div class="space-y-2">
          <label
            v-for="r in reasons"
            :key="r"
            class="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-2.5 rounded-xl border border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900 transition"
          >
            <input
              type="radio"
              name="cancelReason"
              :value="r"
              v-model="selectedReason"
              class="text-forest focus:ring-forest cursor-pointer"
            />
            <span>{{ r }}</span>
          </label>
        </div>

        <textarea
          v-if="selectedReason === 'Alasan lainnya'"
          v-model="customReason"
          rows="2"
          placeholder="Tuliskan alasan pembatalan..."
          class="w-full mt-2 bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl p-3 text-xs text-theme-primary focus:outline-none focus:border-forest"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex items-center gap-3">
        <button
          @click="emit('close')"
          class="flex-1 py-2.5 px-4 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer text-center"
        >
          Kembali
        </button>
        <button
          @click="handleConfirm"
          :disabled="isSubmitting"
          class="flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          <div v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span v-else>Batalkan Tagihan Pesanan</span>
        </button>
      </div>
    </div>
  </div>
</template>
