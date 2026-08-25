<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyOrders, type OrderStatusFilter } from '@/presentation/composables/useMyOrders'
import { useAuth } from '@/presentation/composables/useAuth'
import { formatRupiah } from '@/core/utils/currency'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import OrderTimelineModal from '@/presentation/components/orders/OrderTimelineModal.vue'
import ExtendRentalModal from '@/presentation/components/orders/ExtendRentalModal.vue'
import QuickPaymentModal from '@/presentation/components/orders/QuickPaymentModal.vue'
import CancelOrderModal from '@/presentation/components/orders/CancelOrderModal.vue'
import OrderReviewModal from '@/presentation/components/orders/OrderReviewModal.vue'
import InvoicePrintModal from '@/presentation/components/orders/InvoicePrintModal.vue'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconDeliveryTruck,
  IconCalendarDate,
  IconCheck,
  IconShieldCheck,
  IconClock,
  IconArrowRight,
  IconSearch,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconQrcode,
  IconClose,
  IconStar,
} from '@/presentation/components/icons'

const router = useRouter()
const { currentUser, isLoggedIn, openLoginModal } = useAuth()

const activeReviewOrder = ref<OrderDto | null>(null)
const activeInvoiceOrder = ref<OrderDto | null>(null)
const {
  filteredOrders,
  isLoading,
  selectedTab,
  activeTimelineOrder,
  activeExtendOrder,
  activePaymentOrder,
  activeCancelOrder,
  loadOrders,
  openTimeline,
  closeTimeline,
  openExtend,
  closeExtend,
  openPayment,
  closePayment,
  openCancel,
  closeCancel,
  confirmExtendRental,
  confirmPayOrder,
  confirmCancelOrder,
} = useMyOrders()

const tabs: { id: OrderStatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Semua Pesanan' },
  { id: 'ACTIVE', label: 'Sedang Berjalan (Aktif)' },
  { id: 'PENDING', label: 'Menunggu Bayar' },
  { id: 'COMPLETED', label: 'Selesai & Dibatalkan' },
]

// Set to track expanded multi-item cards
const expandedOrderIds = ref<Set<string>>(new Set())

function toggleExpandOrder(orderId: string) {
  if (expandedOrderIds.value.has(orderId)) {
    expandedOrderIds.value.delete(orderId)
  } else {
    expandedOrderIds.value.add(orderId)
  }
}

function isOrderExpanded(orderId: string): boolean {
  return expandedOrderIds.value.has(orderId)
}

// Pagination States & Logic
const currentPage = ref(1)
const pageSize = ref(3)
const pageSizeOptions = [3, 5, 10]

const totalOrders = computed(() => filteredOrders.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / pageSize.value)))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOrders.value.slice(start, start + pageSize.value)
})

const paginationStart = computed(() => {
  if (totalOrders.value === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalOrders.value)
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  if (typeof window !== 'undefined') {
    const el = document.getElementById('my-orders-list')
    if (el) {
      const headerOffset = 120
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function prevPage() {
  goToPage(currentPage.value - 1)
}

function nextPage() {
  goToPage(currentPage.value + 1)
}

watch([selectedTab, pageSize], () => {
  currentPage.value = 1
})

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
    openLoginModal()
    router.replace('/')
    return
  }
  loadOrders()
})

function getStatusBadge(order: OrderDto) {
  if (order.lifecycleStatus === 'CANCELLED' || order.paymentStatus === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      classes: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-300 dark:border-stone-700 font-bold',
    }
  }
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
      <!-- Unauthenticated State -->
      <div v-if="!isLoggedIn" class="text-center py-20 bg-theme-card rounded-3xl border border-theme-border p-8 animate-fade-up">
        <div class="w-16 h-16 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow border border-forest/20 flex items-center justify-center mx-auto mb-4">
          <IconShieldCheck :size="32" />
        </div>
        <h2 class="font-display text-2xl font-black text-theme-primary">Akses Khusus Member</h2>
        <p class="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-2">
          Halaman riwayat pesanan dan pelacakan sewa hanya dapat diakses oleh akun yang sudah masuk.
        </p>
        <button
          @click="openLoginModal"
          class="mt-6 px-6 py-2.5 bg-[#244E33] hover:bg-[#1B3B26] text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition"
        >
          Masuk ke Akun Anda
        </button>
      </div>

      <!-- Authenticated Member Dashboard -->
      <div v-else class="space-y-6">
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
              Pantau status pengiriman, sisa durasi masa sewa, batalkan sewa, dan akses invoice digital Anda.
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
      <div id="my-orders-list" class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
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

      <!-- Order Cards List (Paginated) -->
      <div v-else class="space-y-5">
        <div
          v-for="order in paginatedOrders"
          :key="order.id"
          class="bg-theme-card rounded-3xl border border-theme-border p-5 sm:p-6 shadow-card space-y-4 transition-all hover:border-forest/40"
        >
          <!-- Card Top Bar: Order ID, Date, Item Count Badge, Status Badge -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-border text-xs">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-stone-500">ID Sewa:</span>
              <span class="font-black text-theme-primary bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-md border border-theme-border">
                {{ order.id }}
              </span>
              <span
                v-if="order.items.length > 1"
                class="px-2 py-0.5 rounded-md bg-forest/10 border border-forest/20 text-forest dark:text-forest-glow font-extrabold text-[11px]"
              >
                {{ order.items.length }} Unit Paket Sewa
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

          <!-- Multi-item Thumbnail Quick Strip (if multiple items) -->
          <div
            v-if="order.items.length > 1"
            class="flex items-center gap-2 pb-2 overflow-x-auto custom-scrollbar"
          >
            <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">Unit:</span>
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900 border border-theme-border px-2 py-1 rounded-xl shrink-0"
            >
              <img
                :src="item.primaryImage"
                :alt="item.productName"
                class="w-6 h-6 rounded-lg object-cover border border-theme-border"
              />
              <span class="text-xs font-bold text-theme-primary max-w-[120px] sm:max-w-[160px] truncate">
                {{ item.productName }}
              </span>
            </div>
          </div>

          <!-- Order Items Breakdown -->
          <div class="space-y-3">
            <!-- Primary Visible Items (Up to 2 items) -->
            <div
              v-for="(item, idx) in (isOrderExpanded(order.id) ? order.items : order.items.slice(0, 2))"
              :key="idx"
              class="flex gap-3.5 items-center p-2.5 sm:p-3 rounded-2xl bg-stone-50/60 dark:bg-stone-900/60 border border-theme-border/70"
            >
              <img
                :src="item.primaryImage"
                :alt="item.productName"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-stone-100 dark:bg-stone-900 border border-theme-border shrink-0"
              />
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-extrabold text-sm text-theme-primary truncate">
                    {{ item.productName }}
                  </h3>
                  <span class="font-black text-xs text-forest dark:text-forest-glow shrink-0">
                    {{ formatRupiah(item.totalAmount) }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span class="inline-flex items-center gap-1 font-bold text-theme-primary">
                    <IconCalendarDate :size="12" class="text-forest" />
                    <span>{{ item.startDate }} s/d {{ item.endDate }} ({{ item.rentalDays }} Hari)</span>
                  </span>
                  <span>•</span>
                  <span>Tarif: {{ formatRupiah(item.dailyRate) }}/hari</span>
                  <span>•</span>
                  <span>Qty: {{ item.quantity }} unit</span>
                </div>
              </div>
            </div>

            <!-- Expand / Collapse Button for 3+ items -->
            <div v-if="order.items.length > 2" class="pt-1">
              <button
                @click="toggleExpandOrder(order.id)"
                class="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-theme-border text-xs font-bold text-forest dark:text-forest-glow flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span v-if="!isOrderExpanded(order.id)">
                  + Lihat {{ order.items.length - 2 }} unit perlengkapan lainnya
                </span>
                <span v-else>
                  Sembunyikan rincian unit
                </span>
                <IconChevronDown
                  :size="12"
                  :class="['transition-transform duration-200', isOrderExpanded(order.id) && 'rotate-180']"
                />
              </button>
            </div>
          </div>

          <!-- Order Footer: Total & Action Buttons -->
          <div class="pt-4 border-t border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">Total Pembayaran Sewa</span>
              <p class="font-black text-base sm:text-lg text-theme-primary">
                {{ formatRupiah(order.pricing.grandTotal) }}
                <span class="text-xs font-normal text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                  (Bebas Deposit Member)
                </span>
              </p>
            </div>

            <!-- Interactive Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Pending Payment Action Button (Hidden if cancelled) -->
              <button
                v-if="(order.paymentStatus === 'PENDING' || order.lifecycleStatus === 'PENDING_PAYMENT') && order.lifecycleStatus !== 'CANCELLED' && order.paymentStatus !== 'CANCELLED'"
                @click="openPayment(order)"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-md transition cursor-pointer animate-pulse"
              >
                <IconQrcode :size="14" />
                <span>Bayar Sekarang</span>
              </button>

              <!-- Timeline Tracking Modal Button -->
              <button
                @click="openTimeline(order)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
              >
                <IconDeliveryTruck :size="14" class="text-forest" />
                <span>Lacak Status</span>
              </button>

              <!-- Review & Rating Button (for completed orders) -->
              <button
                v-if="order.lifecycleStatus === 'COMPLETED'"
                type="button"
                @click="activeReviewOrder = order"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <IconStar :size="13" class="fill-current text-amber-500" />
                <span>Beri Ulasan</span>
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

              <!-- Cancel Unpaid Order Button (Hidden if cancelled or paid) -->
              <button
                v-if="(order.paymentStatus === 'PENDING' || order.lifecycleStatus === 'PENDING_PAYMENT') && order.lifecycleStatus !== 'CANCELLED' && order.paymentStatus !== 'CANCELLED'"
                @click="openCancel(order)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <IconClose :size="12" class="stroke-[2.5]" />
                <span>Batalkan Pesanan</span>
              </button>

              <!-- Digital Invoice Print Action -->
              <button
                type="button"
                @click="activeInvoiceOrder = order"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-sm transition cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Cetak Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

        <!-- Interactive Pagination Controls -->
        <div
          v-if="filteredOrders.length > 0"
          class="pt-6 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        >
          <!-- Showing Entries Summary -->
          <div class="text-stone-500 font-semibold text-center sm:text-left">
            Menampilkan <span class="font-bold text-theme-primary">{{ paginationStart }}</span> –
            <span class="font-bold text-theme-primary">{{ paginationEnd }}</span> dari
            <span class="font-bold text-theme-primary">{{ totalOrders }}</span> pesanan sewa
          </div>

          <!-- Page Navigation Controls -->
          <div class="flex items-center gap-1.5">
            <!-- Prev Button -->
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-2 rounded-xl border border-theme-border font-bold transition cursor-pointer flex items-center gap-1',
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-theme-primary hover:border-forest/40'
              ]"
              aria-label="Halaman Sebelumnya"
            >
              <IconChevronLeft :size="14" />
              <span class="hidden sm:inline">Sebelumnya</span>
            </button>

            <!-- Page Number Pills -->
            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'w-8 h-8 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center border',
                  currentPage === page
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next Button -->
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-2 rounded-xl border border-theme-border font-bold transition cursor-pointer flex items-center gap-1',
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-theme-primary hover:border-forest/40'
              ]"
              aria-label="Halaman Selanjutnya"
            >
              <span class="hidden sm:inline">Selanjutnya</span>
              <IconChevronRight :size="14" />
            </button>
          </div>

          <!-- Per Page Selector -->
          <div class="flex items-center gap-2 text-stone-500 font-semibold">
            <span>Tampilkan:</span>
            <select
              v-model="pageSize"
              class="bg-stone-100 dark:bg-stone-800 border border-theme-border rounded-lg px-2.5 py-1 text-xs font-bold text-theme-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }} pesanan
              </option>
            </select>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CancelOrderModal
      :order="activeCancelOrder"
      @close="closeCancel"
      @confirm-cancel="confirmCancelOrder"
    />

    <QuickPaymentModal
      :order="activePaymentOrder"
      @close="closePayment"
      @confirm-payment="confirmPayOrder"
      @cancel-order="openCancel"
    />

    <OrderTimelineModal
      :order="activeTimelineOrder"
      @close="closeTimeline"
    />

    <ExtendRentalModal
      :order="activeExtendOrder"
      @close="closeExtend"
      @confirm-extension="confirmExtendRental"
    />

    <OrderReviewModal
      :order="activeReviewOrder"
      @close="activeReviewOrder = null"
    />

    <InvoicePrintModal
      :order="activeInvoiceOrder"
      @close="activeInvoiceOrder = null"
    />

    <AppFooter />
  </div>
</template>
