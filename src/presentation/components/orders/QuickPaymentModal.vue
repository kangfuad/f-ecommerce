<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconClose,
  IconCheck,
  IconClock,
  IconQrcode,
  IconBank,
  IconShieldCheck,
  IconCopy,
} from '@/presentation/components/icons'

interface Props {
  order: OrderDto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm-payment', orderId: string): void
  (e: 'cancel-order', order: OrderDto): void
}>()

useBodyScrollLock(() => !!props.order)

const isSubmitting = ref(false)
const copiedVa = ref(false)
const copiedAmount = ref(false)

// Countdown timer (15 minutes in seconds)
const timeLeftSeconds = ref(900)
let timerInterval: any = null

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeLeftSeconds.value > 0) {
      timeLeftSeconds.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formattedTimeLeft = computed(() => {
  const mins = Math.floor(timeLeftSeconds.value / 60)
  const secs = timeLeftSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const displayVaNumber = computed(() => {
  if (!props.order) return '8077712345678'
  if (props.order.vaNumber) return props.order.vaNumber
  if (props.order.paymentMethod === 'BCA_VA') return '80777' + props.order.customer.phone.slice(-8)
  if (props.order.paymentMethod === 'MANDIRI_VA') return '88708' + props.order.customer.phone.slice(-8)
  if (props.order.paymentMethod === 'BRI_VA') return '12800' + props.order.customer.phone.slice(-8)
  return '80777890123456'
})

function copyVa() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(displayVaNumber.value)
    copiedVa.value = true
    setTimeout(() => {
      copiedVa.value = false
    }, 2000)
  }
}

function copyAmount() {
  if (!props.order) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.order.pricing.grandTotal.toString())
    copiedAmount.value = true
    setTimeout(() => {
      copiedAmount.value = false
    }, 2000)
  }
}

async function handleConfirm() {
  if (!props.order) return
  isSubmitting.value = true
  try {
    emit('confirm-payment', props.order.id)
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
          <div class="flex items-center gap-2">
            <h3 class="font-extrabold text-base text-theme-primary">Pembayaran Tagihan Sewa</h3>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-500/30">
              Menunggu Pembayaran
            </span>
          </div>
          <p class="text-xs text-stone-500">ID Pesanan: {{ order.id }}</p>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Countdown Timer Bar -->
      <div class="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
          <IconClock :size="15" />
          <span>Batas Waktu Pembayaran:</span>
        </div>
        <span class="font-black font-mono text-sm text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-lg">
          {{ formattedTimeLeft }}
        </span>
      </div>

      <!-- Payment Method Gateway Display -->
      <!-- Case 1: QRIS -->
      <div v-if="order.paymentMethod === 'QRIS'" class="p-4 bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-2xl text-center space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest dark:text-forest-glow text-xs font-black">
          <IconQrcode :size="14" />
          <span>QRIS Standar Nasional (Otomatis & Real-Time)</span>
        </div>

        <div class="p-4 bg-white rounded-2xl border border-stone-200 inline-block shadow-sm">
          <!-- QR Code Representation -->
          <svg class="w-44 h-44 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="white" />
            <!-- Corner Markers -->
            <rect x="5" y="5" width="30" height="30" fill="black" />
            <rect x="10" y="10" width="20" height="20" fill="white" />
            <rect x="15" y="15" width="10" height="10" fill="black" />

            <rect x="65" y="5" width="30" height="30" fill="black" />
            <rect x="70" y="10" width="20" height="20" fill="white" />
            <rect x="75" y="15" width="10" height="10" fill="black" />

            <rect x="5" y="65" width="30" height="30" fill="black" />
            <rect x="10" y="70" width="20" height="20" fill="white" />
            <rect x="15" y="75" width="10" height="10" fill="black" />

            <!-- Grid dots -->
            <rect x="42" y="8" width="6" height="6" fill="black" />
            <rect x="52" y="8" width="6" height="6" fill="black" />
            <rect x="42" y="20" width="16" height="6" fill="black" />
            <rect x="42" y="32" width="6" height="16" fill="black" />
            <rect x="52" y="42" width="6" height="6" fill="black" />
            <rect x="8" y="42" width="6" height="16" fill="black" />
            <rect x="20" y="42" width="16" height="6" fill="black" />
            <rect x="65" y="42" width="16" height="6" fill="black" />
            <rect x="85" y="42" width="10" height="6" fill="black" />
            <rect x="42" y="65" width="6" height="16" fill="black" />
            <rect x="42" y="85" width="16" height="10" fill="black" />
            <rect x="65" y="65" width="16" height="6" fill="black" />
            <rect x="65" y="75" width="6" height="16" fill="black" />
            <rect x="75" y="85" width="20" height="10" fill="black" />
          </svg>
        </div>

        <p class="text-xs text-stone-500">
          Pindai kode QR menggunakan aplikasi BCA, GoPay, OVO, Dana, ShopeePay, Livin', atau m-Banking Anda.
        </p>
      </div>

      <!-- Case 2: Virtual Account -->
      <div v-else class="p-4 bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-2xl space-y-3 text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-theme-border">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <IconBank :size="14" />
            </div>
            <span class="font-bold text-theme-primary">
              {{ order.paymentMethod.replace('_', ' ') }}
            </span>
          </div>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verifikasi Otomatis</span>
        </div>

        <div class="space-y-1">
          <span class="text-stone-500 text-[11px] font-bold">Nomor Virtual Account:</span>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-theme-border">
            <span class="font-mono font-black text-sm text-theme-primary tracking-wider">{{ displayVaNumber }}</span>
            <button
              @click="copyVa"
              class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-xs font-bold text-theme-primary transition cursor-pointer"
            >
              {{ copiedVa ? 'Tersalin' : 'Salin VA' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Nominal Tagihan -->
      <div class="p-3.5 rounded-2xl bg-forest/10 border border-forest/25 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-stone-600 dark:text-stone-400">Total Tagihan Yang Harus Dibayar:</span>
          <div class="flex items-center gap-2">
            <span class="font-black text-sm sm:text-base text-forest dark:text-forest-glow">
              {{ formatRupiah(order.pricing.grandTotal) }}
            </span>
            <button
              @click="copyAmount"
              class="text-[10px] font-bold text-stone-500 hover:text-theme-primary bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-theme-border cursor-pointer"
            >
              {{ copiedAmount ? 'Tersalin' : 'Salin' }}
            </button>
          </div>
        </div>
        <p class="text-[11px] text-stone-500">
          ✓ Tidak ada biaya deposit jaminan (Status member KYC terverifikasi).
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 space-y-2.5">
        <div class="flex items-center gap-3">
          <button
            @click="emit('close')"
            class="flex-1 py-2.5 px-4 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer text-center"
          >
            Bayar Nanti
          </button>
          <button
            @click="handleConfirm"
            :disabled="isSubmitting"
            class="flex-1 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <div v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white dark:border-stone-950 border-t-transparent rounded-full animate-spin"></div>
            <IconCheck v-else :size="14" />
            <span>{{ isSubmitting ? 'Memverifikasi...' : 'Konfirmasi Pembayaran' }}</span>
          </button>
        </div>

        <div class="text-center pt-1">
          <button
            @click="emit('close'); emit('cancel-order', order)"
            class="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Batalkan Tagihan Pesanan Ini
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
