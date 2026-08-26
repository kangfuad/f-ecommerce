<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { formatRupiah } from '@/core/utils/currency'
import { useAuth } from '@/presentation/composables/useAuth'
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
  IconDownload,
} from '@/presentation/components/icons'

const router = useRouter()
const { currentUser, isLoggedIn } = useAuth()
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

// File Upload state (Real file handling with Image & PDF support)
const selectedAgreementFile = ref<File | null>(null)
const agreementFileName = ref('')
const agreementFileSize = ref('')
const agreementFilePreview = ref('')
const isAgreementPdf = ref(false)

const selectedBillFile = ref<File | null>(null)
const billFileName = ref('')
const billFileSize = ref('')
const billFilePreview = ref('')
const isBillPdf = ref(false)

const agreementFileInputRef = ref<HTMLInputElement | null>(null)
const billFileInputRef = ref<HTMLInputElement | null>(null)

async function fetchOrders() {
  isLoading.value = true
  try {
    const res = await OrderService.getProviderOrders()
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
        message: 'Jadwal dan lokasi transaksi serah terima telah dikonfirmasi.',
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
  rejectionReasonInput.value = 'Jadwal bentrok dengan penyewa lain / unit sedang dalam perawatan berkala.'
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
        message: 'Penyewa telah diberitahu mengenai pembatalan ini.',
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
  selectedAgreementFile.value = null
  selectedBillFile.value = null
  agreementFilePreview.value = order.signedAgreementUrl || ''
  agreementFileName.value = order.signedAgreementUrl ? 'Surat_Perjanjian_Sewa_Bertandatangan.jpg' : ''
  isAgreementPdf.value = false

  billFilePreview.value = order.paymentBillUrl || ''
  billFileName.value = order.paymentBillUrl ? 'Kwitansi_Pembayaran_Offline.jpg' : ''
  isBillPdf.value = false
}

// File Handlers for Agreement
function handleAgreementFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    showToast({ type: 'error', title: 'File Terlalu Besar', message: 'Maksimal ukuran file 10 MB.' })
    return
  }

  selectedAgreementFile.value = file
  agreementFileName.value = file.name
  agreementFileSize.value = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
  isAgreementPdf.value = file.type === 'application/pdf' || file.name.endsWith('.pdf')

  const reader = new FileReader()
  reader.onload = (e) => {
    agreementFilePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// File Handlers for Bill
function handleBillFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    showToast({ type: 'error', title: 'File Terlalu Besar', message: 'Maksimal ukuran file 10 MB.' })
    return
  }

  selectedBillFile.value = file
  billFileName.value = file.name
  billFileSize.value = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
  isBillPdf.value = file.type === 'application/pdf' || file.name.endsWith('.pdf')

  const reader = new FileReader()
  reader.onload = (e) => {
    billFilePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function saveUploadDocs() {
  if (!selectedOrderForUpload.value) return
  if (!agreementFilePreview.value && !billFilePreview.value && !selectedAgreementFile.value && !selectedBillFile.value) {
    showToast({
      type: 'warning',
      title: 'Berkas Belum Dipilih',
      message: 'Silakan pilih berkas foto atau dokumen PDF sebelum menyimpan.',
    })
    return
  }

  isActionLoading.value = true
  try {
    await OrderService.uploadSignedAgreementAndBill(selectedOrderForUpload.value.id, {
      signedAgreementFile: selectedAgreementFile.value,
      paymentBillFile: selectedBillFile.value,
      signedAgreementUrl: agreementFilePreview.value,
      paymentBillUrl: billFilePreview.value,
    })
    
    showToast({
      type: 'success',
      title: 'Berkas Berhasil Disimpan!',
      message: 'Surat perjanjian sewa TTD dan bukti tagihan (bill) telah tersimpan di sistem.',
    })
    selectedOrderForUpload.value = null
    await fetchOrders()
  } catch (err: any) {
    showToast({
      type: 'error',
      title: 'Gagal Menyimpan',
      message: err.message || 'Terjadi kesalahan saat mengunggah berkas.',
    })
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
        
        <!-- Access Control Guard: If user is not a provider / store owner -->
        <div
          v-if="isLoggedIn && currentUser && !currentUser.hasProviderStore"
          class="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme-border shadow-md text-center space-y-4 max-w-xl mx-auto my-12"
        >
          <div class="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <IconShieldCheck :size="32" />
          </div>
          <h2 class="font-extrabold text-xl text-theme-primary">Akses Khusus Mitra Penyedia Sewa</h2>
          <p class="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Akun Anda saat ini terdaftar sebagai <strong>Penyewa (User)</strong>. Halaman ini hanya dapat diakses oleh mitra yang memiliki lapak atau listing unit sewa terdaftar.
          </p>
          <div class="pt-2">
            <router-link
              to="/pesanan-saya"
              class="px-6 py-2.5 rounded-full bg-[#244E33] text-white text-xs font-bold hover:bg-[#1B3B26] transition inline-block"
            >
              Kembali ke Pesanan Saya
            </router-link>
          </div>
        </div>

        <!-- Main Provider Dashboard View -->
        <template v-else>
          <!-- Header Banner -->
          <div class="p-4 sm:p-6 md:p-8 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-2 min-w-0">
                <!-- Badges Row -->
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 text-[10px] font-black uppercase tracking-wider shrink-0">
                    Panel Mitra Penyedia Sewa
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow text-[11px] font-bold border border-forest/20 truncate max-w-[200px] sm:max-w-xs">
                    {{ currentUser?.providerStoreName || 'Mitra Penyedia Resmi' }}
                  </span>
                </div>

                <!-- Title & Description -->
                <h1 class="font-display text-xl sm:text-2xl md:text-3xl font-black text-theme-primary leading-tight">
                  Timeline & Kelola Booking Penyedia
                </h1>
                <p class="text-xs text-stone-500 max-w-2xl leading-relaxed">
                  Terima atau tolak booking, cetak form perjanjian sewa resmi, dan unggah berkas bertandatangan beserta bukti bill pembayaran setelah serah terima unit.
                </p>
              </div>

              <!-- Quick Link Button to Tenant View -->
              <div class="shrink-0 pt-1 sm:pt-0">
                <router-link
                  to="/pesanan-saya"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition shadow-xs"
                >
                  <span>Mode Penyewa (User)</span>
                  <span class="text-xs text-stone-400">→</span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Metric Counter Tabs (Responsive 3 Tabs) -->
          <div class="grid grid-cols-3 gap-2 sm:gap-4">
            <button
              type="button"
              @click="activeTab = 'PENDING'"
              :class="[
                'p-2.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0',
                activeTab === 'PENDING'
                  ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                  : 'bg-theme-card border-theme-border hover:border-stone-400'
              ]"
            >
              <span class="text-[11px] sm:text-xs font-extrabold text-amber-700 dark:text-amber-400 truncate block">Permintaan Masuk</span>
              <div class="flex items-baseline justify-between mt-1 sm:mt-2">
                <span class="text-xl sm:text-2xl font-black font-mono text-theme-primary">{{ pendingOrders.length }}</span>
                <span class="hidden sm:inline text-[10px] text-stone-400 font-bold">Perlu Konfirmasi</span>
              </div>
            </button>

            <button
              type="button"
              @click="activeTab = 'ACTIVE'"
              :class="[
                'p-2.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0',
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20'
                  : 'bg-theme-card border-theme-border hover:border-stone-400'
              ]"
            >
              <span class="text-[11px] sm:text-xs font-extrabold text-emerald-700 dark:text-emerald-300 truncate block">Pesanan Aktif</span>
              <div class="flex items-baseline justify-between mt-1 sm:mt-2">
                <span class="text-xl sm:text-2xl font-black font-mono text-theme-primary">{{ activeOrders.length }}</span>
                <span class="hidden sm:inline text-[10px] text-stone-400 font-bold">Siap / Berjalan</span>
              </div>
            </button>

            <button
              type="button"
              @click="activeTab = 'COMPLETED'"
              :class="[
                'p-2.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0',
                activeTab === 'COMPLETED'
                  ? 'bg-stone-500/10 border-stone-500/40 ring-2 ring-stone-500/20'
                  : 'bg-theme-card border-theme-border hover:border-stone-400'
              ]"
            >
              <span class="text-[11px] sm:text-xs font-extrabold text-stone-600 dark:text-stone-300 truncate block">Riwayat Selesai</span>
              <div class="flex items-baseline justify-between mt-1 sm:mt-2">
                <span class="text-xl sm:text-2xl font-black font-mono text-theme-primary">{{ completedOrders.length }}</span>
                <span class="hidden sm:inline text-[10px] text-stone-400 font-bold">Ditutup</span>
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
                  <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Jadwal & Lokasi Serah Terima:</span>
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
                  <!-- Provider Only: Cetak Form Sewa TTD -->
                  <button
                    type="button"
                    @click="selectedOrderForPrint = order"
                    class="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition cursor-pointer flex items-center gap-1.5"
                  >
                    <IconDownload :size="13" />
                    <span>Cetak Form Sewa TTD</span>
                  </button>

                  <button
                    type="button"
                    @click="openUploadModal(order)"
                    class="px-3.5 py-2 rounded-xl border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-theme-primary transition cursor-pointer"
                  >
                    {{ order.signedAgreementUrl ? 'Update Berkas TTD & Bill' : 'Upload Berkas TTD & Bill' }}
                  </button>

                  <!-- Button Selesaikan Sewa only visible AFTER documents (TTD & Bill) are uploaded -->
                  <button
                    v-if="order.signedAgreementUrl || order.paymentBillUrl"
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
        </template>

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

    <!-- Upload Signed Document & Bill Modal (Real File PDF / Image Upload) -->
    <div v-if="selectedOrderForUpload" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="selectedOrderForUpload = null" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-theme-border z-10 space-y-5">
        
        <div class="flex items-center justify-between pb-3 border-b border-theme-border">
          <div>
            <h3 class="font-extrabold text-base text-theme-primary">Upload Berkas Sewa & Bill Pembayaran</h3>
            <p class="text-[11px] text-stone-500">Unggah berkas foto atau dokumen PDF surat perjanjian sewa dan bukti kwitansi tagihan.</p>
          </div>
          <button @click="selectedOrderForUpload = null" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
            <IconClose :size="14" />
          </button>
        </div>
        
        <div class="space-y-4 text-xs">
          <!-- 1. Agreement File Picker -->
          <div class="space-y-1.5">
            <label class="font-bold block text-theme-primary">1. Berkas Surat Perjanjian Sewa (TTD):</label>
            <input
              type="file"
              ref="agreementFileInputRef"
              accept="image/*,application/pdf"
              @change="handleAgreementFileSelect"
              class="hidden"
            />
            
            <div
              @click="agreementFileInputRef?.click()"
              class="p-4 rounded-2xl border-2 border-dashed border-theme-border hover:border-forest/50 bg-stone-50 dark:bg-stone-900/60 cursor-pointer transition flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-forest/10 text-forest dark:text-forest-glow flex items-center justify-center shrink-0">
                  <IconDownload :size="18" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-theme-primary truncate">
                    {{ agreementFileName || 'Pilih Foto / Dokumen PDF Surat TTD' }}
                  </p>
                  <p class="text-[10px] text-stone-400 font-mono">
                    {{ agreementFileSize || 'Format JPG, PNG, atau PDF (Maks. 10 MB)' }}
                  </p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-[11px] font-bold shrink-0">
                Browse
              </span>
            </div>

            <!-- Preview if Image -->
            <div v-if="agreementFilePreview && !isAgreementPdf" class="mt-2 h-24 w-36 rounded-xl overflow-hidden border border-theme-border">
              <img :src="agreementFilePreview" alt="Preview Surat" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- 2. Bill File Picker -->
          <div class="space-y-1.5">
            <label class="font-bold block text-theme-primary">2. Bukti Kwitansi / Bill Pembayaran Offline:</label>
            <input
              type="file"
              ref="billFileInputRef"
              accept="image/*,application/pdf"
              @change="handleBillFileSelect"
              class="hidden"
            />
            
            <div
              @click="billFileInputRef?.click()"
              class="p-4 rounded-2xl border-2 border-dashed border-theme-border hover:border-forest/50 bg-stone-50 dark:bg-stone-900/60 cursor-pointer transition flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <IconDownload :size="18" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-theme-primary truncate">
                    {{ billFileName || 'Pilih Foto / Dokumen PDF Kwitansi / Bill' }}
                  </p>
                  <p class="text-[10px] text-stone-400 font-mono">
                    {{ billFileSize || 'Format JPG, PNG, atau PDF (Maks. 10 MB)' }}
                  </p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-[11px] font-bold shrink-0">
                Browse
              </span>
            </div>

            <!-- Preview if Image -->
            <div v-if="billFilePreview && !isBillPdf" class="mt-2 h-24 w-36 rounded-xl overflow-hidden border border-theme-border">
              <img :src="billFilePreview" alt="Preview Bill" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-theme-border">
          <button @click="selectedOrderForUpload = null" class="px-4 py-2 rounded-xl text-xs font-bold text-stone-500">Batal</button>
          <button
            @click="saveUploadDocs"
            :disabled="isActionLoading"
            class="px-5 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {{ isActionLoading ? 'Menyimpan...' : 'Simpan Berkas' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Form Perjanjian Sewa Print Modal (Provider view only) -->
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
