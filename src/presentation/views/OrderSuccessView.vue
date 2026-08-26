<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { formatRupiah } from '@/core/utils/currency'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import InvoicePrintModal from '@/presentation/components/orders/InvoicePrintModal.vue'
import {
  IconCheck,
  IconCalendarDate,
  IconLocation,
  IconArrowRight,
} from '@/presentation/components/icons'

const route = useRoute()
const router = useRouter()

const currentOrder = ref<OrderDto | null>(null)
const isLoading = ref(true)
const showInvoiceModal = ref(false)

onMounted(async () => {
  const orderId = route.params.orderId as string
  if (!orderId) {
    router.replace('/pesanan-saya')
    return
  }

  try {
    const res = await OrderService.getOrderById(orderId)
    if (res.status === 'success' && res.data) {
      currentOrder.value = res.data
    } else {
      router.replace('/pesanan-saya')
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div v-if="isLoading" class="text-center py-16 text-xs text-stone-400">
        Memuat rincian booking...
      </div>

      <div v-else-if="currentOrder" class="space-y-6 animate-fade-up">
        
        <!-- Header -->
        <div class="text-center space-y-2.5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-2xs">
            <IconCheck :size="13" class="stroke-[3] text-emerald-600 dark:text-emerald-400" />
            <span>Pengajuan Booking Berhasil Dikirim</span>
          </div>

          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Booking Reservasi Diterima
          </h1>

          <p class="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Permintaan sewa Anda telah diteruskan ke penyedia sewa. Transaksi dan pembayaran dilakukan saat serah terima di lokasi.
          </p>
        </div>

        <!-- Receipt Card -->
        <div class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-7 shadow-xl space-y-5">
          
          <div class="flex items-center justify-between border-b border-theme-border pb-4">
            <div>
              <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">ID Booking</span>
              <span class="font-mono font-black text-sm sm:text-base text-theme-primary">{{ currentOrder.id }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Status</span>
              <span class="text-xs font-bold text-amber-600 dark:text-amber-400">Menunggu Konfirmasi</span>
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
                    {{ item.startDate }} s/d {{ item.endDate }} ({{ item.rentalDays }} Hari)
                  </p>
                </div>
              </div>
              <span class="font-black text-xs text-theme-primary shrink-0">{{ formatRupiah(item.totalAmount) }}</span>
            </div>
          </div>

          <!-- Meetup Info -->
          <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border space-y-1.5 text-xs">
            <span class="text-[10px] text-stone-400 font-bold uppercase block">Jadwal & Tempat Serah Terima:</span>
            <p class="font-extrabold text-theme-primary flex items-center gap-1.5">
              <IconCalendarDate :size="13" class="text-forest dark:text-forest-glow" />
              <span>{{ currentOrder.meetup.scheduleDate }} • {{ currentOrder.meetup.scheduleTime }}</span>
            </p>
            <p class="text-stone-500 flex items-start gap-1.5 text-[11px]">
              <IconLocation :size="13" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
              <span>{{ currentOrder.meetup.locationName }} ({{ currentOrder.meetup.locationAddress }})</span>
            </p>
          </div>

          <!-- Cost Summary -->
          <div class="border-t border-theme-border pt-3.5 space-y-2 text-xs">
            <div class="flex justify-between text-stone-500">
              <span>Estimasi Biaya Sewa</span>
              <span class="font-bold text-theme-primary">{{ formatRupiah(currentOrder.pricing.subtotalRental) }}</span>
            </div>
            <div class="flex justify-between text-stone-500">
              <span>Pelunasan</span>
              <span class="font-bold text-theme-primary">Direct Settlement (Offline di Lokasi)</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-theme-border text-sm font-extrabold text-theme-primary">
              <span>Total Tagihan</span>
              <span class="text-forest dark:text-forest-glow text-base font-black font-mono">
                {{ formatRupiah(currentOrder.pricing.grandTotal || currentOrder.pricing.subtotalRental) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2.5 pt-2">
            <button
              type="button"
              @click="showInvoiceModal = true"
              class="w-full py-2.5 px-4 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition cursor-pointer text-center"
            >
              Lihat Form Perjanjian Sewa (PDF)
            </button>

            <router-link
              to="/pesanan-saya"
              class="w-full py-3 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>Pantau Status di Pesanan Saya</span>
              <IconArrowRight :size="14" />
            </router-link>
          </div>

        </div>

      </div>
    </main>

    <!-- Modal Form Sewa -->
    <InvoicePrintModal
      v-if="showInvoiceModal && currentOrder"
      :order="currentOrder"
      @close="showInvoiceModal = false"
    />

    <AppFooter />
  </div>
</template>
