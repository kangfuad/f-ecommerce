<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { formatRupiah } from '@/core/utils/currency'
import { useToast } from '@/presentation/composables/useToast'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import InvoicePrintModal from '@/presentation/components/orders/InvoicePrintModal.vue'
import RentalReviewModal from '@/presentation/components/orders/RentalReviewModal.vue'
import {
  IconCalendarDate,
  IconLocation,
  IconCheck,
  IconClose,
  IconClock,
  IconShieldCheck,
  IconStar,
  IconBoxPackage,
} from '@/presentation/components/icons'

const router = useRouter()
const { showToast } = useToast()

const orders = ref<OrderDto[]>([])
const isLoading = ref(true)
const activeTab = ref<'PENDING' | 'ACTIVE' | 'COMPLETED'>('PENDING')

// Modal states
const selectedOrderForPrint = ref<OrderDto | null>(null)
const selectedOrderForReview = ref<OrderDto | null>(null)
const selectedOrderForUpload = ref<OrderDto | null>(null)
const selectedOrderForReject = ref<OrderDto | null>(null)

const rejectionReasonInput = ref('')
const isActionLoading = ref(false)

// Simulated document upload state
const sampleSignedUrl = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop'
const sampleBillUrl = 'https://images.unsplash.com/photo-1554415707-9e49016a30c5?q=80&w=800&auto=format&fit=crop'
const uploadedAgreementPreview = ref('')
const uploadedBillPreview = ref('')

async function fetchOrders() {
  isLoading.value = true
  try {
    const res = await OrderService.getOrders()
    orders.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})

const pendingOrders = computed(() =>
  orders.value.filter((o) => o.lifecycleStatus === 'PENDING_CONFIRMATION')
)

const activeOrders = computed(() =>
  orders.value.filter((o) => o.lifecycleStatus === 'CONFIRMED' || o.lifecycleStatus === 'ACTIVE_RENTAL')
)

const completedOrders = computed(() =>
  orders.value.filter((o) => o.lifecycleStatus === 'COMPLETED')
)

const currentTabOrders = computed(() => {
  switch (activeTab.value) {
    case 'PENDING':
      return pendingOrders.value
    case 'ACTIVE':
      return activeOrders.value
    case 'COMPLETED':
      return completedOrders.value
    default:
      return []
  }
})

// Provider Action: Accept Booking
async function handleAccept(orderId: string) {
  isActionLoading.value = true
  try {
    const res = await OrderService.acceptBooking(orderId)
    if (res.status === 'success') {
      showToast({
        type: 'success',
        title: 'Booking Diterima!',
        message: 'Jadwal dan tempat transaksi telah dikonfirmasi.',
      })
      await fetchOrders()
      activeTab.value = 'ACTIVE'
    }
  } finally {
    isActionLoading.value = false
  }
}

// Provider Action: Open Reject Modal
function openRejectModal(order: OrderDto) {
  selectedOrderForReject.value = order
  rejectionReasonInput.value = 'Jadwal bertabrakan dengan penyewa lain / unit dalam servis berkala.'
}

async function confirmReject() {
  if (!selectedOrderForReject.value) return
  isActionLoading.value = true
  try {
    const res = await OrderService.rejectBooking(selectedOrderForReject.value.id, rejectionReasonInput.value)
    if (res.status === 'success') {
      showToast({
        type: 'info',
        title: 'Booking Ditolak',
        message: 'Penyewa telah diberitahu mengenai penolakan ini.',
      })
      selectedOrderForReject.value = null
      await fetchOrders()
    }
  } finally {
    isActionLoading.value = false
  }
}

// Provider Action: Open Upload Docs Modal
function openUploadModal(order: OrderDto) {
  selectedOrderForUpload.value = order
  uploadedAgreementPreview.value = order.signedAgreementUrl || sampleSignedUrl
  uploadedBillPreview.value = order.paymentBillUrl || sampleBillUrl
}

async function saveUploadDocs() {
  if (!selectedOrderForUpload.value) return
  isActionLoading.value = true
  try {
    await OrderService.uploadSignedAgreement(selectedOrderForUpload.value.id, uploadedAgreementPreview.value)
    await OrderService.uploadPaymentBill(selectedOrderForUpload.value.id, uploadedBillPreview.value)
    
    showToast({
      type: 'success',
      title: 'Berkas Berhasil Disimpan!',
      message: 'Surat perjanjian TTD dan bukti bill pembayaran telah terunggah.',
    })
    selectedOrderForUpload.value = null
    await fetchOrders()
  } finally {
    isActionLoading.value = false
  }
}

// Provider Action: Complete Rental
async function handleComplete(orderId: string) {
  isActionLoading.value = true
  try {
    const res = await OrderService.completeRental(orderId)
    if (res.status === 'success') {
      showToast({
        type: 'success',
        title: 'Sewa Selesai & Ditutup!',
        message: 'Transaksi telah selesai. Silakan berikan penilaian reputasi penyewa.',
      })
      await fetchOrders()
      activeTab.value = 'COMPLETED'
    }
  } finally {
    isActionLoading.value = false
  }
}

function handleReviewSubmitted(updated: OrderDto) {
  const idx = orders.value.findIndex((o) => o.id === updated.id)
  if (idx >= 0) {
    orders.value[idx] = updated
  }
}
</script>

<template>
  <div class="min-h-screen bg-theme-bg text-theme-primary flex flex-col">
    <AppHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header & Switcher Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-[#244E33] text-white text-[10px] font-black uppercase">
                Panel Penyedia Sewa
              </span>
              <span class="text-xs text-stone-500 font-mono">CinemaTech Rental Jakarta</span>
            </div>
            <h1 class="font-display text-2xl font-extrabold text-theme-primary">
              Timeline & Kelola Booking Penyedia
            </h1>
            <p class="text-xs text-stone-500 max-w-xl">
              Terima atau tolak pengajuan sewa, terbitkan surat perjanjian sewa resmi, dan unggah bukti bill pembayaran setelah serah terima offline selesai.
            </p>
          </div>

          <!-- Quick link to User View -->
          <div class="flex items-center gap-2">
            <router-link
              to="/pesanan-saya"
              class="px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition"
            >
              Lihat Sebagai Penyewa (User)
            </router-link>
          </div>
        </div>

        <!-- Metric Counter Tabs -->
        <div class="grid grid-cols-3 gap-3 sm:gap-4">
          <button
            type="button"
            @click="activeTab = 'PENDING'"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              activeTab === 'PENDING'
                ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                : 'bg-theme-card border-theme-border hover:border-stone-400'
            ]"
          >
            <span class="text-xs font-bold text-amber-700 dark:text-amber-400">Permintaan Masuk</span>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-2xl font-black font-mono text-theme-primary">{{ pendingOrders.length }}</span>
              <span class="text-[10px] text-stone-400 font-bold">Perlu Konfirmasi</span>
            </div>
          </button>

          <button
            type="button"
            @click="activeTab = 'ACTIVE'"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              activeTab === 'ACTIVE'
                ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20'
                : 'bg-theme-card border-theme-border hover:border-stone-400'
            ]"
          >
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Pesanan Aktif</span>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-2xl font-black font-mono text-theme-primary">{{ activeOrders.length }}</span>
              <span class="text-[10px] text-stone-400 font-bold">Siap / Berjalan</span>
            </div>
          </button>

          <button
            type="button"
            @click="activeTab = 'COMPLETED'"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              activeTab === 'COMPLETED'
                ? 'bg-stone-500/10 border-stone-500/40 ring-2 ring-stone-500/20'
                : 'bg-theme-card border-theme-border hover:border-stone-400'
            ]"
          >
            <span class="text-xs font-bold text-stone-600 dark:text-stone-300">Riwayat Selesai</span>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-2xl font-black font-mono text-theme-primary">{{ completedOrders.length }}</span>
              <span class="text-[10px] text-stone-400 font-bold">Ditutup</span>
            </div>
          </button>
        </div>

        <!-- Orders Timeline List -->
        <div v-if="isLoading" class="p-12 text-center text-xs text-stone-400">
          Memuat data booking penyedia...
        </div>

        <div v-else-if="currentTabOrders.length === 0" class="p-12 text-center rounded-3xl bg-theme-card border border-theme-border space-y-2">
          <p class="font-extrabold text-sm text-theme-primary">Tidak Ada Pesanan pada Tab Ini</p>
          <p class="text-xs text-stone-500">Semua permintaan booking telah diproses dengan rapi.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in currentTabOrders"
            :key="order.id"
            class="p-5 sm:p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-5 transition"
          >
            <!-- Order Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-theme-border">
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold text-theme-primary">#{{ order.id }}</span>
                <span class="text-[11px] text-stone-400">Diajukan: {{ order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-' }}</span>
              </div>

              <!-- Status Badge -->
              <div>
                <span
                  v-if="order.lifecycleStatus === 'PENDING_CONFIRMATION'"
                  class="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase"
                >
                  Menunggu Konfirmasi Anda
                </span>
                <span
                  v-else-if="order.lifecycleStatus === 'CONFIRMED'"
                  class="px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase"
                >
                  Dikonfirmasi (Menunggu Serah Terima)
                </span>
                <span
                  v-else-if="order.lifecycleStatus === 'ACTIVE_RENTAL'"
                  class="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase"
                >
                  Sewa Aktif Berjalan
                </span>
                <span
                  v-else-if="order.lifecycleStatus === 'COMPLETED'"
                  class="px-3 py-1 rounded-full bg-stone-500/15 text-stone-700 dark:text-stone-300 border border-stone-500/30 text-[10px] font-black uppercase"
                >
                  Selesai
                </span>
              </div>
            </div>

            <!-- Customer & Meetup Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border text-xs">
              <!-- Customer Profile -->
              <div class="space-y-1">
                <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Penyewa (Tenant):</span>
                <div class="flex items-center gap-2">
                  <strong class="text-theme-primary text-sm">{{ order.customer.fullName }}</strong>
                  <span v-if="order.customer.isKycVerified" class="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] font-black">
                    KYC Verified
                  </span>
                </div>
                <p class="text-stone-500 text-[11px]">WA: {{ order.customer.phone }} • {{ order.customer.email }}</p>
                <p v-if="order.bookingNotes" class="text-[11px] text-stone-600 dark:text-stone-300 italic pt-1">
                  "{{ order.bookingNotes }}"
                </p>
              </div>

              <!-- Meetup Details -->
              <div class="space-y-1 md:border-l md:border-theme-border md:pl-4">
                <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Jadwal & Tempat Serah Terima:</span>
                <p class="font-extrabold text-theme-primary flex items-center gap-1.5">
                  <IconCalendarDate :size="13" class="text-forest dark:text-forest-glow" />
                  <span>{{ order.meetup.scheduleDate }} • {{ order.meetup.scheduleTime }}</span>
                </p>
                <p class="text-stone-500 flex items-start gap-1.5 text-[11px]">
                  <IconLocation :size="13" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
                  <span>{{ order.meetup.locationName }} ({{ order.meetup.locationAddress }})</span>
                </p>
              </div>
            </div>

            <!-- Items -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Unit yang Disewa:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50/50 dark:bg-stone-900/50 border border-theme-border"
                >
                  <img :src="item.primaryImage" :alt="item.productName" class="w-12 h-12 rounded-xl object-cover border border-theme-border shrink-0" />
                  <div class="min-w-0 flex-1 text-xs">
                    <p class="font-bold text-theme-primary truncate">{{ item.productName }}</p>
                    <p class="text-[10px] text-stone-500">
                      {{ item.quantity }}x • {{ item.rentalDays }} Hari ({{ item.startDate }} s/d {{ item.endDate }})
                    </p>
                    <p class="text-xs font-mono font-bold text-forest dark:text-forest-glow">{{ formatRupiah(item.totalAmount) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Action Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-theme-border">
              <div>
                <span class="text-[10px] text-stone-500 block">Total Tagihan Sewa (Offline):</span>
                <span class="text-sm font-black font-mono text-forest dark:text-forest-glow">
                  {{ formatRupiah(order.pricing.grandTotal || order.pricing.subtotalRental) }}
                </span>
              </div>

              <!-- PENDING ACTIONS -->
              <div v-if="order.lifecycleStatus === 'PENDING_CONFIRMATION'" class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openRejectModal(order)"
                  class="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition cursor-pointer"
                >
                  Tolak Booking
                </button>

                <button
                  type="button"
                  @click="handleAccept(order.id)"
                  :disabled="isActionLoading"
                  class="px-5 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <IconCheck :size="13" />
                  <span>Terima & Konfirmasi Jadwal</span>
                </button>
              </div>

              <!-- ACTIVE ACTIONS -->
              <div v-else-if="order.lifecycleStatus === 'CONFIRMED' || order.lifecycleStatus === 'ACTIVE_RENTAL'" class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  @click="selectedOrderForPrint = order"
                  class="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition cursor-pointer"
                >
                  Cetak Form Sewa TTD
                </button>

                <button
                  type="button"
                  @click="openUploadModal(order)"
                  class="px-3.5 py-2 rounded-xl border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
                >
                  {{ order.signedAgreementUrl ? 'Update Berkas TTD & Bill' : 'Upload Berkas TTD & Bill' }}
                </button>

                <button
                  type="button"
                  @click="handleComplete(order.id)"
                  class="px-4 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-xs"
                >
                  Selesaikan Sewa
                </button>
              </div>

              <!-- COMPLETED ACTIONS -->
              <div v-else-if="order.lifecycleStatus === 'COMPLETED'" class="flex items-center gap-2">
                <button
                  type="button"
                  @click="selectedOrderForPrint = order"
                  class="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
                >
                  Lihat Form Sewa
                </button>

                <button
                  v-if="!order.providerReview"
                  type="button"
                  @click="selectedOrderForReview = order"
                  class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <IconStar :size="12" />
                  <span>Nilai Reputasi Penyewa</span>
                </button>

                <span v-else class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <IconCheck :size="12" />
                  <span>Sudah Dinilai</span>
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Reject Reason Modal -->
    <div v-if="selectedOrderForReject" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="selectedOrderForReject = null" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-theme-border z-10 space-y-4">
        <h3 class="font-extrabold text-base text-theme-primary">Tolak Pengajuan Booking</h3>
        <p class="text-xs text-stone-500">Berikan alasan penolakan agar penyewa dapat menyesuaikan jadwal atau unit.</p>
        <textarea
          v-model="rejectionReasonInput"
          rows="3"
          class="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none"
        ></textarea>
        <div class="flex justify-end gap-2">
          <button @click="selectedOrderForReject = null" class="px-4 py-2 rounded-xl text-xs font-bold text-stone-500">Batal</button>
          <button @click="confirmReject" class="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">Konfirmasi Tolak</button>
        </div>
      </div>
    </div>

    <!-- Upload Signed Document & Bill Modal -->
    <div v-if="selectedOrderForUpload" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="selectedOrderForUpload = null" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-theme-border z-10 space-y-4">
        <h3 class="font-extrabold text-base text-theme-primary">Upload Berkas Sewa & Bill Pembayaran</h3>
        <p class="text-xs text-stone-500">Unggah foto form perjanjian sewa bertandatangan dan kwitansi bill pembayaran offline.</p>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold block mb-1">1. Surat Perjanjian Sewa (TTD):</label>
            <input v-model="uploadedAgreementPreview" type="text" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs font-mono" />
          </div>
          <div>
            <label class="font-bold block mb-1">2. Kwitansi / Bill Pembayaran:</label>
            <input v-model="uploadedBillPreview" type="text" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs font-mono" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="selectedOrderForUpload = null" class="px-4 py-2 rounded-xl text-xs font-bold text-stone-500">Batal</button>
          <button @click="saveUploadDocs" class="px-5 py-2 rounded-xl bg-[#244E33] text-white text-xs font-bold">Simpan Berkas</button>
        </div>
      </div>
    </div>

    <!-- Form Perjanjian Sewa Print Modal -->
    <InvoicePrintModal
      v-if="selectedOrderForPrint"
      :order="selectedOrderForPrint"
      @close="selectedOrderForPrint = null"
    />

    <!-- Provider Review for Tenant Modal -->
    <RentalReviewModal
      v-if="selectedOrderForReview"
      :order="selectedOrderForReview"
      reviewRole="PROVIDER"
      @close="selectedOrderForReview = null"
      @submitted="handleReviewSubmitted"
    />

    <AppFooter />
  </div>
</template>
