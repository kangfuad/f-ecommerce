<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/presentation/composables/useCart'
import { useAuth } from '@/presentation/composables/useAuth'
import { useCheckout, DEFAULT_STUDIO_HUBS } from '@/presentation/composables/useCheckout'
import { formatRupiah } from '@/core/utils/currency'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import {
  IconShieldCheck,
  IconLocation,
  IconCalendarDate,
  IconCheck,
  IconArrowRight,
  IconClock,
  IconStar,
} from '@/presentation/components/icons'

const router = useRouter()
const { cartItems, subtotalRental } = useCart()
const { currentUser, isLoggedIn, openLoginModal } = useAuth()

const {
  fullName,
  email,
  phone,
  deliveryAddress,
  meetupLocationType,
  meetupLocationName,
  meetupLocationAddress,
  meetupScheduleDate,
  meetupScheduleTime,
  meetupNotes,
  bookingNotes,
  agreeTerms,
  isSubmitting,
  checkoutError,
  isValidForm,
  initForm,
  setLocationType,
  submitBookingRequest,
} = useCheckout()

const showValidationErrors = ref(false)
const isEditingProfileContact = ref(false)

onMounted(() => {
  initForm()
  if (cartItems.value.length === 0) {
    router.replace('/katalog')
  }
})

// Auto-fill form when user logs in
watch(
  currentUser,
  (newUser) => {
    if (newUser) {
      fullName.value = newUser.fullName
      email.value = newUser.email
      phone.value = newUser.phone
      if (newUser.savedAddresses && newUser.savedAddresses.length > 0 && !deliveryAddress.value) {
        deliveryAddress.value = newUser.savedAddresses[0].fullAddress
      }
    }
  },
  { immediate: true }
)

const timeOptions = [
  '08:00 WIB',
  '09:00 WIB',
  '10:00 WIB',
  '11:00 WIB',
  '13:00 WIB',
  '14:00 WIB',
  '15:00 WIB',
  '16:00 WIB',
  '17:00 WIB',
  '19:00 WIB',
]

async function handleSubmit() {
  if (!isLoggedIn.value) {
    openLoginModal()
    return
  }

  showValidationErrors.value = true
  if (!isValidForm.value) return

  await submitBookingRequest()
}
</script>

<template>
  <div class="min-h-screen bg-theme-bg text-theme-primary flex flex-col">
    <AppHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header Title -->
        <div>
          <div class="flex items-center gap-2 text-forest dark:text-forest-glow font-bold text-xs uppercase tracking-wider mb-1">
            <span>Direct Booking Platform</span>
            <span>•</span>
            <span>Konfirmasi Langsung Penyedia</span>
          </div>
          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary">
            Pengajuan Booking Sewa Unit
          </h1>
          <p class="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Tentukan jadwal & lokasi serah terima unit sewa. Tanpa pembayaran in-app — transaksi diselesaikan langsung saat serah terima unit di lokasi.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Booking Form -->
          <div class="lg:col-span-8 space-y-6">
            
            <!-- Step 1: Customer Identity Profile Card -->
            <div class="p-5 sm:p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-theme-border">
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-full bg-[#244E33] text-white flex items-center justify-center font-black text-xs">1</span>
                  <h2 class="font-extrabold text-sm sm:text-base text-theme-primary">Profil Pemesan (Penyewa)</h2>
                </div>
                <button
                  type="button"
                  @click="isEditingProfileContact = !isEditingProfileContact"
                  class="text-xs font-bold text-forest dark:text-forest-glow hover:underline cursor-pointer"
                >
                  {{ isEditingProfileContact ? 'Selesai Ubah' : 'Ubah Kontak' }}
                </button>
              </div>

              <!-- Sleek Profile Card -->
              <div class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-[#244E33] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {{ currentUser?.initials || 'AF' }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <strong class="text-theme-primary text-sm font-extrabold truncate">{{ fullName || currentUser?.fullName || 'Auri Fuad' }}</strong>
                      <span v-if="currentUser?.isKycVerified" class="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-black shrink-0">
                        KYC Terverifikasi
                      </span>
                    </div>
                    <p class="text-xs text-stone-500 font-mono mt-0.5 truncate">
                      {{ phone || currentUser?.phone || '081234567890' }} • {{ email || currentUser?.email || 'auri.fuad@example.com' }}
                    </p>
                    <p v-if="currentUser?.profession" class="text-[10px] text-stone-400 mt-0.5 truncate">
                      {{ currentUser.profession }}
                    </p>
                  </div>
                </div>

                <div class="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-theme-border">
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Skor Reputasi</span>
                  <span class="text-xs font-black text-amber-500 flex items-center sm:justify-end gap-1">
                    <IconStar :size="12" />
                    <span>5.0 (Penyewa Tepercaya)</span>
                  </span>
                </div>
              </div>

              <!-- Editable Inputs (Toggled or Fallback) -->
              <div v-if="isEditingProfileContact || !isLoggedIn" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-theme-border">
                <div>
                  <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">Nama Lengkap *</label>
                  <input
                    v-model="fullName"
                    type="text"
                    placeholder="Contoh: Auri Fuad"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
                  />
                  <p v-if="showValidationErrors && fullName.trim().length < 2" class="text-[11px] text-red-500 mt-1">Nama wajib diisi.</p>
                </div>

                <div>
                  <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">No. WhatsApp Aktif *</label>
                  <input
                    v-model="phone"
                    type="tel"
                    placeholder="0812xxxxxxxx"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition font-mono"
                  />
                  <p v-if="showValidationErrors && phone.trim().length < 8" class="text-[11px] text-red-500 mt-1">Nomor WhatsApp aktif wajib diisi.</p>
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">Email *</label>
                  <input
                    v-model="email"
                    type="email"
                    placeholder="email@domain.com"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2 & 3: Meetup Schedule & Handover Location -->
            <div class="p-5 sm:p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-5">
              <div class="flex items-center gap-2.5 pb-3 border-b border-theme-border">
                <span class="w-6 h-6 rounded-full bg-[#244E33] text-white flex items-center justify-center font-black text-xs">2</span>
                <h2 class="font-extrabold text-sm sm:text-base text-theme-primary">Jadwal & Lokasi Transaksi (Serah Terima)</h2>
              </div>

              <!-- Schedule Date & Time -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <IconCalendarDate :size="14" class="text-forest dark:text-forest-glow" />
                    <span>Tanggal Serah Terima *</span>
                  </label>
                  <input
                    v-model="meetupScheduleDate"
                    type="date"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
                  />
                  <p v-if="showValidationErrors && !meetupScheduleDate" class="text-[11px] text-red-500 mt-1">Pilih tanggal temu serah terima.</p>
                </div>

                <div>
                  <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <IconClock :size="14" class="text-forest dark:text-forest-glow" />
                    <span>Estimasi Jam Temu *</span>
                  </label>
                  <select
                    v-model="meetupScheduleTime"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition cursor-pointer"
                  >
                    <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <!-- Location Option Switcher -->
              <div class="space-y-3 pt-2">
                <label class="block text-xs font-bold text-stone-600 dark:text-stone-300">Pilihan Lokasi Transaksi Serah Terima *</label>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- Hub / Lokasi Penyedia -->
                  <button
                    type="button"
                    @click="setLocationType('PROVIDER_STUDIO')"
                    :class="[
                      'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
                      meetupLocationType === 'PROVIDER_STUDIO'
                        ? 'border-forest bg-forest/5 dark:bg-forest/10 ring-2 ring-forest/20'
                        : 'border-theme-border hover:border-stone-400 bg-stone-50 dark:bg-stone-900'
                    ]"
                  >
                    <div>
                      <strong class="text-xs text-theme-primary block">Lokasi / Hub Penyedia</strong>
                      <p class="text-[10px] text-stone-500 mt-0.5">Ambil langsung di kantor, workshop, atau hub resmi penyedia sewa.</p>
                    </div>
                    <span class="text-[9px] font-black text-forest dark:text-forest-glow">Direkomendasikan</span>
                  </button>

                  <!-- Alamat Domisili Penyewa -->
                  <button
                    type="button"
                    @click="setLocationType('TENANT_ADDRESS')"
                    :class="[
                      'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
                      meetupLocationType === 'TENANT_ADDRESS'
                        ? 'border-forest bg-forest/5 dark:bg-forest/10 ring-2 ring-forest/20'
                        : 'border-theme-border hover:border-stone-400 bg-stone-50 dark:bg-stone-900'
                    ]"
                  >
                    <div>
                      <strong class="text-xs text-theme-primary block">Alamat Domisili Penyewa</strong>
                      <p class="text-[10px] text-stone-500 mt-0.5">Penyedia mengantarkan unit ke alamat rumah atau kantor Anda.</p>
                    </div>
                  </button>

                  <!-- Titik Temu Khusus / Lokasi Acara -->
                  <button
                    type="button"
                    @click="setLocationType('CUSTOM_MEETUP')"
                    :class="[
                      'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
                      meetupLocationType === 'CUSTOM_MEETUP'
                        ? 'border-forest bg-forest/5 dark:bg-forest/10 ring-2 ring-forest/20'
                        : 'border-theme-border hover:border-stone-400 bg-stone-50 dark:bg-stone-900'
                    ]"
                  >
                    <div>
                      <strong class="text-xs text-theme-primary block">Titik Temu / Lokasi Acara</strong>
                      <p class="text-[10px] text-stone-500 mt-0.5">Janji temu di titik strategis atau lokasi proyek/acara yang disepakati.</p>
                    </div>
                  </button>
                </div>

                <!-- Location Address Input -->
                <div v-if="meetupLocationType === 'PROVIDER_STUDIO'" class="space-y-2 pt-2">
                  <label class="block text-[11px] font-bold text-stone-500">Pilih Hub / Titik Penyedia Terdekat:</label>
                  <select
                    v-model="meetupLocationName"
                    @change="(e: any) => {
                      const found = DEFAULT_STUDIO_HUBS.find(h => h.name === e.target.value)
                      if (found) meetupLocationAddress = found.address
                    }"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition cursor-pointer"
                  >
                    <option v-for="hub in DEFAULT_STUDIO_HUBS" :key="hub.name" :value="hub.name">
                      {{ hub.name }} — {{ hub.address }}
                    </option>
                  </select>
                </div>

                <div v-else class="space-y-1.5 pt-2">
                  <label class="block text-[11px] font-bold text-stone-500">Alamat Lengkap / Patokan Titik Temu *</label>
                  <textarea
                    v-model="meetupLocationAddress"
                    rows="2"
                    placeholder="Tuliskan nama gedung, jalan, nomor, atau patokan lokasi temu..."
                    class="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
                  ></textarea>
                  <p v-if="showValidationErrors && meetupLocationAddress.trim().length < 3" class="text-[11px] text-red-500">Alamat atau patokan lokasi wajib diisi.</p>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                  Catatan Tambahan untuk Penyedia (Opsional)
                </label>
                <input
                  v-model="bookingNotes"
                  type="text"
                  placeholder="Contoh: Mohon sediakan perlengkapan lengkap dengan hardcase & kabel cadangan."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs focus:ring-2 focus:ring-forest outline-none transition"
                />
              </div>
            </div>

            <!-- Step 4: Terms Agreement -->
            <div class="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border space-y-3">
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="agreeTerms"
                  class="mt-1 w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                />
                <span class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Saya memahami bahwa pengajuan ini merupakan <strong>booking awal reservasi sewa</strong>. Serah terima unit, penandatanganan form perjanjian sewa resmi, dan pembayaran biaya sewa dilakukan secara langsung di luar aplikasi saat jadwal temu bersama penyedia sewa.
                </span>
              </label>
            </div>

            <div v-if="checkoutError" class="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
              {{ checkoutError }}
            </div>

          </div>

          <!-- Right Column: Booking Summary Card -->
          <div class="lg:col-span-4 space-y-5 sticky top-24">
            <div class="p-5 sm:p-6 rounded-3xl bg-theme-card border border-theme-border shadow-md space-y-4">
              
              <div class="flex items-center justify-between pb-3 border-b border-theme-border">
                <h3 class="font-extrabold text-sm text-theme-primary">Ringkasan Unit Sewa</h3>
                <span class="text-xs text-stone-500 font-mono">{{ cartItems.length }} Unit</span>
              </div>

              <!-- Items list -->
              <div class="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                <div
                  v-for="item in cartItems"
                  :key="item.id"
                  class="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border/60"
                >
                  <img
                    :src="item.product.primaryImage"
                    :alt="item.product.name"
                    class="w-12 h-12 rounded-xl object-cover shrink-0 border border-theme-border"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-xs text-theme-primary truncate">{{ item.product.name }}</p>
                    <p class="text-[10px] text-stone-500 font-mono">
                      {{ item.quantity }}x • {{ item.booking.durationDays }} Hari ({{ formatRupiah(item.product.dailyRate.amount) }}/hari)
                    </p>
                    <p class="text-xs font-bold text-forest dark:text-forest-glow font-mono mt-0.5">
                      {{ item.totalRentalAmount.format() }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="border-t border-theme-border pt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                <div class="flex justify-between">
                  <span>Estimasi Biaya Sewa:</span>
                  <span class="font-mono font-bold text-theme-primary">{{ subtotalRental.format() }}</span>
                </div>
                <div class="flex justify-between text-[11px]">
                  <span>Pelunasan:</span>
                  <span class="font-bold text-theme-primary">Direct Settlement di Lokasi</span>
                </div>

                <div class="flex justify-between items-center pt-2 border-t border-theme-border text-sm font-extrabold text-theme-primary">
                  <span>Total Tagihan:</span>
                  <span class="text-forest dark:text-forest-glow text-lg font-black font-mono">
                    {{ subtotalRental.format() }}
                  </span>
                </div>
              </div>

              <!-- Submit Button -->
              <BaseButton
                @click="handleSubmit"
                :loading="isSubmitting"
                variant="primary"
                size="lg"
                class="w-full cursor-pointer shadow-md text-xs sm:text-sm font-black"
              >
                <span>Kirim Pengajuan Booking</span>
                <IconArrowRight :size="14" />
              </BaseButton>

              <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <p class="font-bold mb-0.5">Alur Booking Sederhana:</p>
                <p>1. Penyedia sewa meninjau & mengonfirmasi jadwal temu Anda.</p>
                <p>2. Form perjanjian sewa resmi disiapkan oleh penyedia.</p>
                <p>3. Serah terima unit, cek fisik bersama & pembayaran di lokasi.</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>

    <AppFooter />
  </div>
</template>
