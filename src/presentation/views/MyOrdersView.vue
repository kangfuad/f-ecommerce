<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyOrders, type OrderStatusFilter } from '@/presentation/composables/useMyOrders'
import { useAuth } from '@/presentation/composables/useAuth'
import { formatRupiah } from '@/core/utils/currency'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import OrderTimelineModal from '@/presentation/components/orders/OrderTimelineModal.vue'
import ExtendRentalModal from '@/presentation/components/orders/ExtendRentalModal.vue'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconDeliveryTruck,
  IconCalendarDate,
  IconCheck,
  IconShieldCheck,
  IconClock,
  IconArrowRight,
  IconSearch,
} from '@/presentation/components/icons'

const router = useRouter()
const { currentUser, isLoggedIn, openLoginModal } = useAuth()
const {
  filteredOrders,
  isLoading,
  selectedTab,
  activeTimelineOrder,
  activeExtendOrder,
  loadOrders,
  openTimeline,
  closeTimeline,
  openExtend,
  closeExtend,
  confirmExtendRental,
} = useMyOrders()

const tabs: { id: OrderStatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Semua Pesanan' },
  { id: 'ACTIVE', label: 'Sedang Berjalan (Aktif)' },
  { id: 'PENDING', label: 'Menunggu Bayar' },
  { id: 'COMPLETED', label: 'Selesai' },
]

onMounted(() => {
  loadOrders()
})

function getStatusBadge(order: OrderDto) {
  switch (order.lifecycleStatus) {
    case 'ACTIVE_RENTAL':
      return {
        label: 'Sewa Aktif Digunakan',
        classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold',
      }
    case 'SHIPPING':
      return {
        label: 'Kurir Mengantar Unit',
        classes: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold',
      }
    case 'READY_PICKUP':
      return {
        label: 'Siap Diambil di Hub',
        classes: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold',
      }
    case 'PREPARING_QC':
      return {
        label: 'QC & Sterilisasi Unit',
        classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold',
      }
    case 'PENDING_PAYMENT':
      return {
        label: 'Menunggu Pembayaran',
        classes: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold',
      }
    case 'COMPLETED':
      return {
        label: 'Sewa Selesai',
        classes: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 font-bold',
      }
    default:
      return {
        label: order.paymentStatus === 'PAID' ? 'Lunas' : 'Menunggu',
        classes: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 font-bold',
      }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <span class="text-[11px] font-extrabold uppercase tracking-widest text-forest dark:text-forest-glow">
            Dashboard Pelanggan
          </span>
          <h1 class="font-display text-2xl sm:text-3xl font-black text-theme-primary mt-0.5">
            Riwayat Pesanan & Tracking Rental
          </h1>
          <p class="text-xs text-stone-500 mt-1">
            Pantau status pengiriman, sisa durasi masa sewa, dan akses invoice digital Anda.
          </p>
        </div>

        <router-link
          to="/katalog"
          class="inline-flex items-center gap-2 bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black px-4 py-2.5 rounded-full shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <span>+ Sewa Unit Baru</span>
          <IconArrowRight :size="13" />
        </router-link>
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer border',
            selectedTab === tab.id
              ? 'bg-forest text-white border-forest shadow-sm'
              : 'border-theme-border bg-theme-card text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-24">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest dark:border-forest-glow border-t-transparent"></div>
        <p class="text-xs text-stone-500 font-semibold mt-3">Memuat riwayat pesanan...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredOrders.length === 0"
        class="text-center py-16 bg-theme-card rounded-3xl border border-theme-border p-8 shadow-card space-y-4"
      >
        <div class="w-16 h-16 rounded-full bg-forest/10 border-2 border-dashed border-forest/30 flex items-center justify-center mx-auto text-forest dark:text-forest-glow">
          <IconDeliveryTruck :size="28" />
        </div>
        <div class="space-y-1 max-w-sm mx-auto">
          <h3 class="font-extrabold text-base text-theme-primary">Belum Ada Pesanan di Tab Ini</h3>
          <p class="text-xs text-stone-500">
            Jelajahi beragam katalog kamera sinema, drone, gadget, dan perlengkapan outdoor siap sewa.
          </p>
        </div>
        <router-link
          to="/katalog"
          class="inline-flex items-center gap-2 bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black px-5 py-2.5 rounded-full shadow-sm transition"
        >
          <span>Eksplorasi Katalog Unit</span>
          <IconArrowRight :size="13" />
        </router-link>
      </div>

      <!-- Order Cards List -->
      <div v-else class="space-y-5">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-theme-card rounded-3xl border border-theme-border p-5 sm:p-6 shadow-card space-y-4 transition-all hover:border-forest/40"
        >
          <!-- Card Top Bar: Order ID, Date, Badge -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-border text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-stone-500">ID Sewa:</span>
              <span class="font-black text-theme-primary bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-md border border-theme-border">
                {{ order.id }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-extrabold border',
                  getStatusBadge(order).classes
                ]"
              >
                {{ getStatusBadge(order).label }}
              </span>
            </div>
          </div>

          <!-- Order Items Snapshot -->
          <div class="space-y-3">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="flex gap-3.5 items-center"
            >
              <img
                :src="item.primaryImage"
                :alt="item.productName"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-stone-100 dark:bg-stone-900 border border-theme-border shrink-0"
              />
              <div class="flex-1 min-w-0 space-y-1">
                <h3 class="font-extrabold text-sm text-theme-primary truncate">
                  {{ item.productName }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span class="inline-flex items-center gap-1 font-bold text-theme-primary">
                    <IconCalendarDate :size="12" class="text-forest" />
                    <span>{{ item.startDate }} s/d {{ item.endDate }} ({{ item.rentalDays }} Hari)</span>
                  </span>
                  <span>•</span>
                  <span>Qty: {{ item.quantity }} unit</span>
                </div>
                <p class="font-black text-xs text-forest dark:text-forest-glow">
                  {{ formatRupiah(item.totalAmount) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Footer: Total & Action Buttons -->
          <div class="pt-4 border-t border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">Total Pembayaran Sewa</span>
              <p class="font-black text-base sm:text-lg text-theme-primary">
                {{ formatRupiah(order.pricing.grandTotal) }}
                <span class="text-xs font-normal text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                  ✓ Bebas Deposit Member
                </span>
              </p>
            </div>

            <!-- Interactive Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Timeline Tracking Modal Button -->
              <button
                @click="openTimeline(order)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
              >
                <IconDeliveryTruck :size="14" class="text-forest" />
                <span>Lacak Status</span>
              </button>

              <!-- Extend Rental Button (for active rental) -->
              <button
                v-if="order.lifecycleStatus === 'ACTIVE_RENTAL'"
                @click="openExtend(order)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <IconCalendarDate :size="14" />
                <span>Perpanjang Sewa</span>
              </button>

              <!-- Digital Invoice Link -->
              <router-link
                :to="`/order-success/${order.id}`"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-sm transition cursor-pointer"
              >
                <span>Faktur Invoice</span>
                <IconArrowRight :size="12" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <OrderTimelineModal
      :order="activeTimelineOrder"
      @close="closeTimeline"
    />

    <ExtendRentalModal
      :order="activeExtendOrder"
      @close="closeExtend"
      @confirm-extension="confirmExtendRental"
    />

    <AppFooter />
  </div>
</template>
