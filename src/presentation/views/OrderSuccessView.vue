<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckout } from '@/presentation/composables/useCheckout'
import { useAuth } from '@/presentation/composables/useAuth'
import { formatRupiah } from '@/core/utils/currency'
import { formatDateToIndonesian } from '@/core/utils/date'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import {
  IconCheck,
  IconShieldCheck,
  IconCalendarDate,
  IconDownload,
  IconArrowRight,
  IconLogo,
} from '@/presentation/components/icons'

const route = useRoute()
const router = useRouter()
const { loadOrderFromStorage, currentOrder } = useCheckout()
const { isLoggedIn } = useAuth()

const isDownloading = ref(false)

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      router.replace('/')
    }
  }
)

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/')
    return
  }
  const orderId = route.params.orderId as string
  const order = loadOrderFromStorage(orderId)
  if (!order) {
    router.replace('/katalog')
  }
})

function handleDownloadInvoice() {
  isDownloading.value = true
  setTimeout(() => {
    isDownloading.value = false
    window.print()
  }, 400)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div v-if="currentOrder" class="space-y-6 animate-fade-up">
        
        <!-- Minimalist Success Header -->
        <div class="text-center space-y-2.5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-2xs">
            <IconCheck :size="13" class="stroke-[3] text-emerald-600 dark:text-emerald-400" />
            <span>Pembayaran Berhasil Dikonfirmasi</span>
          </div>

          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Pesanan Sewa Diterima
          </h1>

          <p class="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Unit sedang dipersiapkan oleh tim QC untuk jadwal serah terima Anda.
          </p>
        </div>

        <!-- Clean Digital Receipt Card -->
        <div class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-7 shadow-xl space-y-5">
          
          <!-- Invoice Header Bar -->
          <div class="flex items-center justify-between border-b border-theme-border pb-4">
            <div>
              <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">ID Transaksi</span>
              <span class="font-mono font-black text-sm sm:text-base text-theme-primary">{{ currentOrder.id }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Metode Pembayaran</span>
              <span class="text-xs font-bold text-theme-primary">{{ currentOrder.paymentMethod }}</span>
            </div>
          </div>

          <!-- Unit Items List -->
          <div class="space-y-2.5">
            <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Unit yang Disewa</span>
            
            <div
              v-for="item in currentOrder.items"
              :key="item.productId"
              class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="item.primaryImage"
                  :alt="item.productName"
                  class="w-12 h-12 rounded-xl object-cover border border-theme-border shrink-0"
                />
                <div class="min-w-0">
                  <p class="font-extrabold text-xs text-theme-primary truncate">{{ item.productName }}</p>
                  <p class="text-[11px] text-forest dark:text-forest-glow font-bold mt-0.5">
                    {{ formatDateToIndonesian(item.startDate) }} - {{ formatDateToIndonesian(item.endDate) }}
                    <span class="text-stone-500 font-normal">({{ item.rentalDays }} Hari)</span>
                  </p>
                </div>
              </div>
              <span class="font-black text-xs text-theme-primary shrink-0">{{ formatRupiah(item.totalAmount) }}</span>
            </div>
          </div>

          <!-- Customer & Serah Terima Info -->
          <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-[10px] text-stone-400 font-bold uppercase block">Penyewa</span>
              <p class="font-bold text-theme-primary mt-0.5 truncate">{{ currentOrder.customer.fullName }}</p>
              <p class="text-[11px] text-stone-500 truncate">{{ currentOrder.customer.phone }}</p>
            </div>
            <div>
              <span class="text-[10px] text-stone-400 font-bold uppercase block">Serah Terima</span>
              <p class="font-bold text-theme-primary mt-0.5 truncate">
                {{ currentOrder.customer.deliveryMethod === 'DELIVERY' ? 'Kurir Khusus' : 'Ambil di Hub' }}
              </p>
              <p class="text-[11px] text-stone-500 truncate">
                {{ currentOrder.customer.deliveryAddress || currentOrder.customer.pickupHub }}
              </p>
            </div>
          </div>

          <!-- Cost Summary Breakdown -->
          <div class="border-t border-theme-border pt-3.5 space-y-2 text-xs">
            <div class="flex justify-between text-stone-500">
              <span>Tarif Sewa Unit</span>
              <span class="font-bold text-theme-primary">{{ formatRupiah(currentOrder.pricing.subtotalRental) }}</span>
            </div>

            <div class="flex justify-between text-stone-500">
              <span>Ongkos Kirim / Pickup</span>
              <span class="font-bold text-theme-primary">
                {{ currentOrder.pricing.deliveryFee > 0 ? formatRupiah(currentOrder.pricing.deliveryFee) : 'Gratis' }}
              </span>
            </div>

            <div class="flex justify-between text-stone-500">
              <span>Deposit Jaminan (Refundable)</span>
              <span class="font-bold text-theme-primary">
                {{ currentOrder.pricing.isDepositWaived ? 'Bebas Deposit (Rp 0)' : formatRupiah(currentOrder.pricing.totalDeposit) }}
              </span>
            </div>

            <div class="flex justify-between items-baseline pt-2.5 border-t border-theme-border text-sm">
              <span class="font-extrabold text-theme-primary">Total Pembayaran Lunas</span>
              <span class="font-black text-base sm:text-lg text-forest dark:text-forest-glow">
                {{ formatRupiah(currentOrder.pricing.grandTotal) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-theme-border flex flex-col sm:flex-row gap-2.5">
            <button
              @click="handleDownloadInvoice"
              class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-theme-primary font-bold text-xs transition cursor-pointer"
            >
              <IconDownload :size="14" />
              <span>Cetak / Simpan Invoice</span>
            </button>

            <router-link
              to="/katalog"
              class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 font-black text-xs shadow-sm transition cursor-pointer"
            >
              <span>Eksplorasi Katalog</span>
              <IconArrowRight :size="13" />
            </router-link>
          </div>
        </div>

      </div>
    </main>

    <AppFooter />
  </div>
</template>
