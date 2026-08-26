<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyOrders, type OrderStatusFilter } from '@/presentation/composables/useMyOrders'
import { useAuth } from '@/presentation/composables/useAuth'
import { formatRupiah } from '@/core/utils/currency'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import RentalReviewModal from '@/presentation/components/orders/RentalReviewModal.vue'
import ExtendRentalModal from '@/presentation/components/orders/ExtendRentalModal.vue'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { useToast } from '@/presentation/composables/useToast'
import {
  IconCalendarDate,
  IconLocation,
  IconCheck,
  IconClose,
  IconClock,
  IconShieldCheck,
  IconStar,
  IconChevronLeft,
  IconChevronRight,
} from '@/presentation/components/icons'

const router = useRouter()
const { currentUser, isLoggedIn } = useAuth()
const { showToast } = useToast()

const { orders, filteredOrders, isLoading, selectedTab, loadOrders } = useMyOrders()

const selectedOrderForReview = ref<OrderDto | null>(null)
const selectedOrderForBill = ref<OrderDto | null>(null)
const selectedOrderForTnc = ref<OrderDto | null>(null)
const selectedOrderForExtend = ref<OrderDto | null>(null)

const tabs: { id: OrderStatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Semua Booking' },
  { id: 'PENDING', label: 'Menunggu Konfirmasi' },
  { id: 'ACTIVE', label: 'Dikonfirmasi / Aktif' },
  { id: 'COMPLETED', label: 'Selesai' },
  { id: 'REJECTED', label: 'Ditolak / Batal' },
]

// Pagination
const currentPage = ref(1)
const pageSize = ref(4)

const totalOrders = computed(() => filteredOrders.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / pageSize.value)))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOrders.value.slice(start, start + pageSize.value)
})

onMounted(() => {
  loadOrders()
})

function handleReviewSubmitted(updated: OrderDto) {
  const idx = orders.value.findIndex((o) => o.id === updated.id)
  if (idx >= 0) {
    orders.value[idx] = updated
  }
}

async function handleConfirmExtension(orderId: string, additionalDays: number) {
  try {
    const res = await OrderService.extendRental(orderId, additionalDays)
    if (res.status === 'success' && res.data) {
      const idx = orders.value.findIndex((o) => o.id === orderId)
      if (idx >= 0) {
        orders.value[idx] = res.data
      }
      showToast({
        type: 'success',
        title: 'Masa Sewa Diperpanjang',
        message: `Durasi sewa bertambah +${additionalDays} hari. Estimasi tagihan telah disesuaikan.`,
      })
      selectedOrderForExtend.value = null
    }
  } catch (err: any) {
    showToast({
      type: 'error',
      title: 'Gagal Perpanjang',
      message: err.message || 'Terjadi kesalahan sistem.',
    })
  }
}
function isPdf(url?: string): boolean {
  if (!url) return false
  return url.toLowerCase().includes('.pdf')
}

function getFileName(url?: string): string {
  if (!url) return 'Dokumen'
  try {
    const clean = url.split('?')[0]
    const parts = clean.split('/')
    const last = parts[parts.length - 1]
    return decodeURIComponent(last.replace(/^[0-9]+_/, ''))
  } catch {
    return 'Dokumen_Digital.pdf'
  }
}

</script>

<template>
  <div class="min-h-screen bg-theme-bg text-theme-primary flex flex-col">
    <AppHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-forest dark:text-forest-glow font-bold text-xs uppercase tracking-wider mb-1">
              <span>Riwayat Sewa Pengguna</span>
              <span>•</span>
              <span>Direct Booking & Offline Settlement</span>
            </div>
            <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary">
              Pesanan & Booking Sewa Saya
            </h1>
            <p class="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Pantau status konfirmasi penyedia, cek jadwal dan lokasi transaksi serah terima unit, serta beri ulasan setelah masa sewa selesai.
            </p>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            @click="selectedTab = t.id; currentPage = 1"
            :class="[
              'px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer shrink-0',
              selectedTab === t.id
                ? 'bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-sm'
                : 'bg-theme-card border border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Order List -->
        <div v-if="isLoading" class="p-16 text-center text-xs text-stone-400">
          Memuat riwayat booking Anda...
        </div>

        <div v-else-if="filteredOrders.length === 0" class="p-16 text-center rounded-3xl bg-theme-card border border-theme-border space-y-3">
          <div class="w-16 h-16 rounded-full bg-forest/10 text-forest dark:text-forest-glow flex items-center justify-center mx-auto text-xl font-black">
            EPS
          </div>
          <h3 class="font-extrabold text-base text-theme-primary">Belum Ada Pengajuan Booking</h3>
          <p class="text-xs text-stone-500 max-w-sm mx-auto">
            Jelajahi katalog perlengkapan kami dan pilih unit yang Anda butuhkan untuk kebutuhan atau proyek Anda.
          </p>
          <router-link
            to="/katalog"
            class="inline-block px-5 py-2.5 rounded-full bg-[#244E33] text-white text-xs font-bold hover:bg-[#1B3B26] transition"
          >
            Eksplorasi Katalog Unit
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in paginatedOrders"
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
                  Menunggu Konfirmasi Penyedia
                </span>
                <span
                  v-else-if="order.lifecycleStatus === 'CONFIRMED'"
                  class="px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase"
                >
                  Dikonfirmasi (Siap Serah Terima)
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
                <span
                  v-else-if="order.lifecycleStatus === 'REJECTED'"
                  class="px-3 py-1 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 text-[10px] font-black uppercase"
                >
                  Ditolak Penyedia
                </span>
              </div>
            </div>

            <!-- Rejection Notice if rejected -->
            <div v-if="order.lifecycleStatus === 'REJECTED'" class="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              <strong class="block font-bold mb-0.5">Alasan Penolakan dari Penyedia:</strong>
              <p>{{ order.rejectionReason || 'Jadwal unit bentrok atau sedang dalam servis berkala.' }}</p>
            </div>

            <!-- Meetup & Provider Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border text-xs">
              <!-- Provider Details -->
              <div class="space-y-1">
                <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Penyedia Sewa:</span>
                <div class="flex items-center gap-2">
                  <strong class="text-theme-primary text-sm">{{ order.provider?.name || 'Mitra Penyedia Sewa' }}</strong>
                  <span v-if="order.provider?.rating" class="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                    <IconStar :size="12" />
                    <span>{{ order.provider.rating }}</span>
                  </span>
                </div>
                <p class="text-stone-500 text-[11px]">{{ order.provider?.address }}</p>
                <p class="text-stone-500 text-[11px]">Kontak: {{ order.provider?.phone }}</p>
              </div>

              <!-- Meetup Schedule & Location -->
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

            <!-- Bottom Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-theme-border">
              <div>
                <span class="text-[10px] text-stone-500 block">Estimasi Biaya Sewa (Pelunasan di Lokasi):</span>
                <span class="text-sm font-black font-mono text-forest dark:text-forest-glow">
                  {{ formatRupiah(order.pricing.grandTotal || order.pricing.subtotalRental) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <!-- Button View T&C Notice -->
                <button
                  type="button"
                  @click="selectedOrderForTnc = order"
                  class="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition cursor-pointer"
                >
                  Ketentuan Sewa (T&C)
                </button>

                <!-- Button View Bill & Signed Docs (if uploaded by provider) -->
                <button
                  v-if="order.paymentBillUrl || order.signedAgreementUrl"
                  type="button"
                  @click="selectedOrderForBill = order"
                  class="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer"
                >
                  Lihat Berkas TTD & Bill
                </button>

                <!-- Button Perpanjang Sewa (if active/confirmed) -->
                <button
                  v-if="order.lifecycleStatus === 'ACTIVE_RENTAL' || order.lifecycleStatus === 'CONFIRMED'"
                  type="button"
                  @click="selectedOrderForExtend = order"
                  class="px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconCalendarDate :size="12" />
                  <span>Perpanjang Sewa</span>
                </button>

                <!-- Button Review Provider (if completed) -->
                <button
                  v-if="order.lifecycleStatus === 'COMPLETED' && !order.userReview"
                  type="button"
                  @click="selectedOrderForReview = order"
                  class="px-4 py-1.5 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <IconStar :size="12" />
                  <span>Beri Ulasan Penyedia</span>
                </button>

                <span
                  v-else-if="order.userReview"
                  class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"
                >
                  <IconCheck :size="12" />
                  <span>Ulasan Anda Terkirim</span>
                </span>
              </div>
            </div>

            <!-- Two-way Review Display if available -->
            <div v-if="order.providerReview" class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Ulasan Reputasi dari Penyedia Sewa:</span>
                <span class="text-amber-600 font-bold flex items-center gap-0.5">
                  <IconStar :size="11" />
                  <span>{{ order.providerReview.overallRating }} / 5</span>
                </span>
              </div>
              <p class="text-[11px] text-stone-700 dark:text-stone-300 italic">"{{ order.providerReview.comment }}"</p>
            </div>

          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-theme-border text-xs text-stone-500">
          <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <div class="flex items-center gap-1">
            <button
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="p-2 rounded-lg bg-theme-card border border-theme-border disabled:opacity-40 cursor-pointer"
            >
              <IconChevronLeft :size="14" />
            </button>
            <button
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="p-2 rounded-lg bg-theme-card border border-theme-border disabled:opacity-40 cursor-pointer"
            >
              <IconChevronRight :size="14" />
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- Modal Tenant T&C Notice -->
    <div v-if="selectedOrderForTnc" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div @click="selectedOrderForTnc = null" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-theme-border z-10 space-y-4 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between pb-3 border-b border-theme-border">
          <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">Syarat & Ketentuan Sewa (T&C)</h3>
          <button @click="selectedOrderForTnc = null" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
            <IconClose :size="14" />
          </button>
        </div>

        <div class="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border space-y-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          <p class="font-bold text-theme-primary uppercase text-[10.5px] sm:text-[11px]">KLAUSUL RESMI PENYEWAAN:</p>
          <ol class="list-decimal pl-4 space-y-1.5 text-[10.5px] sm:text-[11px]">
            <li>Unit diserahkan dalam kondisi fisik dan fungsi normal setelah dilakukan uji fungsi (QC) bersama saat serah terima di lokasi.</li>
            <li>Pelunasan biaya sewa diselesaikan langsung saat serah terima unit di lokasi yang disepakati.</li>
            <li>Penyewa bertanggung jawab penuh atas kebersihan, keamanan, dan keutuhan unit selama seluruh masa sewa berlangsung.</li>
            <li>Pengembalian unit wajib tepat waktu sesuai jadwal. Keterlambatan tanpa konfirmasi dikenakan tarif harian normal.</li>
            <li>Formulir perjanjian sewa resmi akan disiapkan dan ditandatangani bersama penyedia sewa saat serah terima di lokasi.</li>
          </ol>
        </div>

        <div class="flex justify-end pt-1">
          <button @click="selectedOrderForTnc = null" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] text-white text-xs font-bold transition cursor-pointer">
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Review Provider -->
    <RentalReviewModal
      v-if="selectedOrderForReview"
      :order="selectedOrderForReview"
      reviewRole="TENANT"
      @close="selectedOrderForReview = null"
      @submitted="handleReviewSubmitted"
    />

    <!-- Modal Extend Rental Duration -->
    <ExtendRentalModal
      v-if="selectedOrderForExtend"
      :order="selectedOrderForExtend"
      @close="selectedOrderForExtend = null"
      @confirm-extension="handleConfirmExtension"
    />

    <!-- Modal View Uploaded Bill & Signed Agreement -->
    <div v-if="selectedOrderForBill" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div @click="selectedOrderForBill = null" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-theme-border z-10 space-y-4 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between pb-2 border-b border-theme-border">
          <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">Berkas Sewa Bertandatangan & Kwitansi Bill</h3>
          <button @click="selectedOrderForBill = null" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-theme-primary transition cursor-pointer">
            <IconClose :size="14" />
          </button>
        </div>
        <p class="text-xs text-stone-500">Dokumen resmi yang telah diunggah oleh penyedia sewa setelah serah terima unit dan pembayaran selesai.</p>
        
        <div class="space-y-4">
          <!-- 1. Surat Perjanjian Sewa (Bertandatangan) -->
          <div v-if="selectedOrderForBill.signedAgreementUrl" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-theme-primary block">1. Surat Perjanjian Sewa (Bertandatangan):</span>
              <a
                :href="selectedOrderForBill.signedAgreementUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[11px] font-bold text-forest dark:text-forest-glow hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Dokumen</span>
                <span class="text-xs">↗</span>
              </a>
            </div>

            <!-- PDF Mode -->
            <div
              v-if="isPdf(selectedOrderForBill.signedAgreementUrl)"
              class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black text-xs shrink-0 border border-red-500/20">
                  PDF
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-theme-primary truncate max-w-xs sm:max-w-sm">
                    {{ getFileName(selectedOrderForBill.signedAgreementUrl) }}
                  </p>
                  <p class="text-[10px] text-stone-400">Dokumen Digital PDF Resmi</p>
                </div>
              </div>
              <a
                :href="selectedOrderForBill.signedAgreementUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition text-center shrink-0 shadow-xs"
              >
                Buka PDF ↗
              </a>
            </div>

            <!-- Image Mode -->
            <div v-else class="rounded-2xl overflow-hidden border border-theme-border bg-stone-100 dark:bg-stone-900 p-1">
              <img :src="selectedOrderForBill.signedAgreementUrl" alt="Surat Sewa TTD" class="w-full max-h-72 object-contain mx-auto rounded-xl" />
            </div>
          </div>

          <!-- 2. Kwitansi / Bill Pembayaran -->
          <div v-if="selectedOrderForBill.paymentBillUrl" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-theme-primary block">2. Kwitansi / Bill Pembayaran:</span>
              <a
                :href="selectedOrderForBill.paymentBillUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[11px] font-bold text-forest dark:text-forest-glow hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Dokumen</span>
                <span class="text-xs">↗</span>
              </a>
            </div>

            <!-- PDF Mode -->
            <div
              v-if="isPdf(selectedOrderForBill.paymentBillUrl)"
              class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black text-xs shrink-0 border border-red-500/20">
                  PDF
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-theme-primary truncate max-w-xs sm:max-w-sm">
                    {{ getFileName(selectedOrderForBill.paymentBillUrl) }}
                  </p>
                  <p class="text-[10px] text-stone-400">Dokumen Kwitansi Tagihan PDF</p>
                </div>
              </div>
              <a
                :href="selectedOrderForBill.paymentBillUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition text-center shrink-0 shadow-xs"
              >
                Buka PDF ↗
              </a>
            </div>

            <!-- Image Mode -->
            <div v-else class="rounded-2xl overflow-hidden border border-theme-border bg-stone-100 dark:bg-stone-900 p-1">
              <img :src="selectedOrderForBill.paymentBillUrl" alt="Bill Pembayaran" class="w-full max-h-72 object-contain mx-auto rounded-xl" />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button @click="selectedOrderForBill = null" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
