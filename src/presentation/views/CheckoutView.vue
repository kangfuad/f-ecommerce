<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/presentation/composables/useCart'
import { useAuth } from '@/presentation/composables/useAuth'
import { useCheckout, AVAILABLE_PICKUP_HUBS } from '@/presentation/composables/useCheckout'
import { useToast } from '@/presentation/composables/useToast'
import { formatRupiah } from '@/core/utils/currency'
import { formatDateToIndonesian } from '@/core/utils/date'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import {
  IconShieldCheck,
  IconDeliveryTruck,
  IconLocation,
  IconCalendarDate,
  IconCheck,
  IconQrcode,
  IconBank,
  IconCreditCard,
  IconCopy,
  IconClock,
  IconArrowRight,
} from '@/presentation/components/icons'

const router = useRouter()
const { cartItems, subtotalRental, totalDeposit, estimatedDeliveryFee, grandTotal } = useCart()
const { currentUser, isLoggedIn, openLoginModal } = useAuth()
const { showToast } = useToast()

const {
  fullName,
  email,
  phone,
  deliveryMethod,
  deliveryAddress,
  pickupHub,
  selectedPaymentMethod,
  agreeTerms,
  currentOrder,
  isSubmitting,
  checkoutError,
  formattedCountdown,
  initForm,
  createOrder,
  simulatePaymentSuccess,
} = useCheckout()

// Checkout step state: 1 = Form & Payment Select, 2 = Payment Instructions & Simulator
const checkoutStep = ref<1 | 2>(1)
const copiedField = ref<string | null>(null)
const showValidationErrors = ref(false)

onMounted(() => {
  initForm()
  if (cartItems.value.length === 0 && !currentOrder.value) {
    router.replace('/katalog')
  }
})

// Auto-fill form when user logs in (Google, Apple, or Email) while on checkout page
watch(
  currentUser,
  (newUser) => {
    if (newUser) {
      fullName.value = newUser.fullName
      email.value = newUser.email
      phone.value = newUser.phone
      showValidationErrors.value = false

      // Auto-fill default saved address if available and empty
      if (newUser.savedAddresses && newUser.savedAddresses.length > 0 && !deliveryAddress.value) {
        const defaultAddr = newUser.savedAddresses.find((a) => a.isDefault) || newUser.savedAddresses[0]
        if (defaultAddr) {
          deliveryAddress.value = `${defaultAddr.fullAddress}, ${defaultAddr.city}`
        }
      }
    }
  },
  { immediate: true }
)

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      router.replace('/')
    }
  }
)

// Validation & completion states for auto-checklists
const isCustomerInfoComplete = computed(() => {
  return fullName.value.trim().length >= 2 && email.value.includes('@') && phone.value.trim().length >= 3
})

const isDeliveryInfoComplete = computed(() => {
  if (deliveryMethod.value === 'DELIVERY') {
    return deliveryAddress.value.trim().length >= 3
  }
  return !!pickupHub.value
})

const isStep1Complete = computed(() => {
  return isCustomerInfoComplete.value && isDeliveryInfoComplete.value && !!selectedPaymentMethod.value && agreeTerms.value
})

// Effective deposit calculation
const effectiveDeposit = computed(() => {
  if (currentUser.value?.isKycVerified) return 0
  return totalDeposit.value.amount
})

const effectiveGrandTotal = computed(() => {
  return subtotalRental.value.amount + effectiveDeposit.value + (deliveryMethod.value === 'DELIVERY' ? estimatedDeliveryFee.value.amount : 0)
})

async function handleProceedToPayment() {
  if (!isCustomerInfoComplete.value || !isDeliveryInfoComplete.value || !agreeTerms.value) {
    showValidationErrors.value = true
    const missing: string[] = []
    if (!fullName.value.trim() || fullName.value.trim().length < 2) missing.push('Nama Lengkap')
    if (!email.value.trim() || !email.value.includes('@')) missing.push('Email')
    if (!phone.value.trim() || phone.value.trim().length < 3) missing.push('No. WhatsApp')
    if (deliveryMethod.value === 'DELIVERY' && (!deliveryAddress.value.trim() || deliveryAddress.value.trim().length < 3)) missing.push('Alamat Pengiriman')
    if (!agreeTerms.value) missing.push('Persetujuan Syarat & Ketentuan')

    showToast({
      type: 'warning',
      title: 'Data Belum Lengkap',
      message: `Mohon isi: ${missing.join(', ')} sebelum melanjutkan ke pembayaran.`,
      duration: 5000,
    })

    const formEl = document.getElementById('customer-info-section')
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  try {
    await createOrder()
    checkoutStep.value = 2
    showValidationErrors.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    showToast({
      type: 'error',
      title: 'Gagal Memproses Pesanan',
      message: e.message || 'Terjadi kendala saat memproses pesanan sewa.',
    })
  }
}

async function goToStep2() {
  if (!isStep1Complete.value && checkoutStep.value === 1) {
    handleProceedToPayment()
    return
  }
  if (checkoutStep.value === 1) {
    await handleProceedToPayment()
  }
}

function copyText(text: string, fieldId: string) {
  navigator.clipboard.writeText(text)
  copiedField.value = fieldId
  setTimeout(() => {
    copiedField.value = null
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
        <router-link to="/" class="hover:text-forest dark:hover:text-forest-glow transition">Beranda</router-link>
        <span>/</span>
        <router-link to="/katalog" class="hover:text-forest dark:hover:text-forest-glow transition">Katalog</router-link>
        <span>/</span>
        <span class="text-theme-primary font-bold">Pembayaran & Checkout Sewa</span>
      </nav>

      <!-- Page Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-theme-border">
        <div>
          <span class="text-xs uppercase font-black tracking-widest text-forest dark:text-forest-glow">
            Proses Transaksi Sewa Aman
          </span>
          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary mt-1">
            Pembayaran & Verifikasi Rental
          </h1>
        </div>

        <!-- Step Indicator (Interactive & Clickable) -->
        <div class="flex items-center gap-2 text-xs font-black">
          <!-- Step 1 Button -->
          <button
            type="button"
            @click="checkoutStep = 1"
            :class="[
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer',
              checkoutStep === 1
                ? 'bg-[#244E33] text-white border-[#1E3E29] dark:bg-emerald-500 dark:text-stone-950 dark:border-emerald-400 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 font-bold hover:bg-emerald-100'
            ]"
          >
            <IconCheck v-if="isStep1Complete || checkoutStep === 2" :size="13" class="stroke-[3] text-emerald-300 dark:text-stone-950" />
            <span v-else class="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black bg-white/20 dark:bg-stone-950/20 text-white dark:text-stone-950">1</span>
            <span>Data & Metode</span>
          </button>

          <span class="text-stone-400 dark:text-stone-500 font-bold">→</span>

          <!-- Step 2 Button (Clickable to advance) -->
          <button
            type="button"
            @click="goToStep2"
            :class="[
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all',
              checkoutStep === 2
                ? 'bg-[#244E33] text-white border-[#1E3E29] dark:bg-emerald-500 dark:text-stone-950 dark:border-emerald-400 shadow-xs cursor-default'
                : isStep1Complete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer shadow-xs animate-pulse'
                  : 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 cursor-pointer'
            ]"
            :title="isStep1Complete ? 'Klik untuk lanjut ke instruksi pembayaran' : 'Lengkapi data formulir terlebih dahulu'"
          >
            <span :class="['w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black', checkoutStep === 2 ? 'bg-white/20 dark:bg-stone-950/20 text-white dark:text-stone-950' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300']">2</span>
            <span>Bayar & Konfirmasi</span>
          </button>
        </div>
      </div>

      <!-- Main 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Form or Payment Instructions (7 cols) -->
        <div class="lg:col-span-7 space-y-6">

          <!-- Error Alert -->
          <div
            v-if="checkoutError"
            class="p-4 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800"
          >
            {{ checkoutError }}
          </div>

          <!-- STEP 1: FORM & PAYMENT SELECTION -->
          <template v-if="checkoutStep === 1">
            <!-- Warning Banner When Form Incomplete -->
            <div
              v-if="showValidationErrors && !isStep1Complete"
              class="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-md animate-fade-up"
            >
              <div class="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0 mt-0.5">
                !
              </div>
              <div class="space-y-1">
                <p class="font-black text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                  Data Formulir Belum Lengkap
                </p>
                <p class="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Mohon lengkapi kolom yang bergaris oranye di bawah (Nama, Email, WhatsApp, dan Alamat Pengiriman) sebelum lanjut ke instruksi pembayaran.
                </p>
              </div>
            </div>

            <!-- KYC Member Perk Banner -->
            <div
              v-if="currentUser?.isKycVerified"
              class="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5"
            >
              <IconShieldCheck :size="24" class="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p class="font-extrabold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                  Member Terverifikasi: Bebas Biaya Deposit Jaminan 100%!
                </p>
                <p class="text-xs text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                  Akun Anda telah terverifikasi KYC. Anda hemat <strong class="font-black">{{ totalDeposit.format() }}</strong> tanpa perlu membayar deposit.
                </p>
              </div>
            </div>

            <!-- Section 1: Customer Data -->
            <div id="customer-info-section" class="bg-theme-card rounded-3xl border border-theme-border p-6 shadow-card space-y-4">
              <div class="flex items-center justify-between border-b border-theme-border pb-3">
                <div class="flex items-center gap-2">
                  <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">
                    1. Informasi Penyewa & Kontak
                  </h3>
                  <!-- Live Auto-Checklist Badge -->
                  <span
                    v-if="isCustomerInfoComplete"
                    class="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-fade-up shadow-2xs"
                  >
                    <IconCheck :size="11" class="stroke-[3]" />
                    <span>Terisi Lengkap</span>
                  </span>
                </div>
                <span v-if="!isLoggedIn" class="text-xs text-forest dark:text-forest-glow hover:underline cursor-pointer font-bold" @click="openLoginModal">
                  Sudah punya akun? Masuk
                </span>
              </div>

              <div class="space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-xs font-bold text-stone-600 dark:text-stone-400">Nama Lengkap (Sesuai KTP)</label>
                    <span v-if="showValidationErrors && (!fullName.trim() || fullName.trim().length < 2)" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                      * Wajib diisi (min. 2 karakter)
                    </span>
                  </div>
                  <input
                    v-model="fullName"
                    type="text"
                    required
                    placeholder="contoh: Ahmad Fuad"
                    :class="[
                      'w-full bg-stone-50 dark:bg-stone-900 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none transition-all',
                      showValidationErrors && (!fullName.trim() || fullName.trim().length < 2)
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                        : 'border-theme-border focus:border-forest'
                    ]"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-bold text-stone-600 dark:text-stone-400">Email Konfirmasi</label>
                      <span v-if="showValidationErrors && (!email.trim() || !email.includes('@'))" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                        * Email belum valid
                      </span>
                    </div>
                    <input
                      v-model="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      :class="[
                        'w-full bg-stone-50 dark:bg-stone-900 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none transition-all',
                        showValidationErrors && (!email.trim() || !email.includes('@'))
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                          : 'border-theme-border focus:border-forest'
                      ]"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-bold text-stone-600 dark:text-stone-400">No. WhatsApp (Aktif)</label>
                      <span v-if="showValidationErrors && (!phone.trim() || phone.trim().length < 3)" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                        * Wajib diisi
                      </span>
                    </div>
                    <input
                      v-model="phone"
                      type="tel"
                      required
                      placeholder="08123456789"
                      :class="[
                        'w-full bg-stone-50 dark:bg-stone-900 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none transition-all',
                        showValidationErrors && (!phone.trim() || phone.trim().length < 3)
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                          : 'border-theme-border focus:border-forest'
                      ]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Delivery / Pickup Method -->
            <div class="bg-theme-card rounded-3xl border border-theme-border p-6 shadow-card space-y-4">
              <div class="flex items-center justify-between border-b border-theme-border pb-3">
                <div class="flex items-center gap-2">
                  <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">
                    2. Metode Serah Terima Unit
                  </h3>
                  <!-- Live Auto-Checklist Badge -->
                  <span
                    v-if="isDeliveryInfoComplete"
                    class="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-fade-up shadow-2xs"
                  >
                    <IconCheck :size="11" class="stroke-[3]" />
                    <span>{{ deliveryMethod === 'DELIVERY' ? 'Alamat Terisi' : 'Hub Terpilih' }}</span>
                  </span>
                </div>
              </div>

              <!-- Radio Tabs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="deliveryMethod = 'DELIVERY'"
                  :class="[
                    'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                    deliveryMethod === 'DELIVERY'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 text-forest dark:text-forest-glow">
                      <IconDeliveryTruck :size="18" />
                      <span class="font-extrabold text-xs">Kurir Khusus Rental</span>
                    </div>
                    <span class="text-xs font-bold text-theme-primary">{{ estimatedDeliveryFee.format() }}</span>
                  </div>
                  <p class="text-[11px] text-stone-500">Diantar dan dijemput langsung ke alamat penyewa oleh staf terlatih.</p>
                </button>

                <button
                  type="button"
                  @click="deliveryMethod = 'PICKUP'"
                  :class="[
                    'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                    deliveryMethod === 'PICKUP'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 text-forest dark:text-forest-glow">
                      <IconLocation :size="18" />
                      <span class="font-extrabold text-xs">Ambil di Hub Operasional</span>
                    </div>
                    <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Gratis (Rp 0)</span>
                  </div>
                  <p class="text-[11px] text-stone-500">Ambil dan kembalikan mandiri di hub terdekat pilihan Anda.</p>
                </button>
              </div>

              <!-- Address input if Delivery -->
              <div v-if="deliveryMethod === 'DELIVERY'" class="space-y-1 pt-1">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block">Alamat Lengkap Pengiriman</label>
                  <span v-if="showValidationErrors && (!deliveryAddress.trim() || deliveryAddress.trim().length < 3)" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                    * Alamat pengiriman wajib diisi
                  </span>
                </div>
                <textarea
                  v-model="deliveryAddress"
                  rows="2"
                  placeholder="Nama jalan, nomor rumah/kantor, RT/RW, kelurahan, kecamatan, kota..."
                  :class="[
                    'w-full bg-stone-50 dark:bg-stone-900 border rounded-xl px-4 py-2.5 text-xs text-theme-primary focus:outline-none transition-all',
                    showValidationErrors && (!deliveryAddress.trim() || deliveryAddress.trim().length < 3)
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                      : 'border-theme-border focus:border-forest'
                  ]"
                ></textarea>
              </div>

              <!-- Hub dropdown if Pickup -->
              <div v-else class="space-y-1 pt-1">
                <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block">Pilih Hub Operasional</label>
                <select
                  v-model="pickupHub"
                  class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-4 py-2.5 text-xs font-bold text-theme-primary focus:outline-none focus:border-forest cursor-pointer"
                >
                  <option v-for="hub in AVAILABLE_PICKUP_HUBS" :key="hub" :value="hub">{{ hub }}</option>
                </select>
              </div>
            </div>

            <!-- Section 3: Payment Method Selection -->
            <div class="bg-theme-card rounded-3xl border border-theme-border p-6 shadow-card space-y-4">
              <div class="flex items-center justify-between border-b border-theme-border pb-3">
                <div class="flex items-center gap-2">
                  <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">
                    3. Pilihan Saluran Pembayaran (Payment Gateway)
                  </h3>
                  <!-- Live Auto-Checklist Badge -->
                  <span
                    v-if="selectedPaymentMethod"
                    class="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-fade-up shadow-2xs"
                  >
                    <IconCheck :size="11" class="stroke-[3]" />
                    <span>{{ selectedPaymentMethod }} Siap</span>
                  </span>
                </div>
              </div>

              <div class="space-y-2.5">
                <!-- QRIS (Recommended) -->
                <label
                  :class="[
                    'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedPaymentMethod === 'QRIS'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center gap-3.5">
                    <input type="radio" v-model="selectedPaymentMethod" value="QRIS" class="accent-forest" />
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center">
                        <IconQrcode :size="18" />
                      </div>
                      <div>
                        <p class="font-extrabold text-xs text-theme-primary">QRIS Real-Time (Otomatis & Kilat)</p>
                        <p class="text-[10px] text-stone-500">BCA, GoPay, OVO, Dana, ShopeePay, Livin', LinkAja</p>
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Paling Populer
                  </span>
                </label>

                <!-- BCA Virtual Account -->
                <label
                  :class="[
                    'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedPaymentMethod === 'BCA_VA'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center gap-3.5">
                    <input type="radio" v-model="selectedPaymentMethod" value="BCA_VA" class="accent-forest" />
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <IconBank :size="18" />
                      </div>
                      <div>
                        <p class="font-extrabold text-xs text-theme-primary">BCA Virtual Account</p>
                        <p class="text-[10px] text-stone-500">Verifikasi instan via BCA Mobile / myBCA / ATM</p>
                      </div>
                    </div>
                  </div>
                </label>

                <!-- Mandiri Virtual Account -->
                <label
                  :class="[
                    'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedPaymentMethod === 'MANDIRI_VA'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center gap-3.5">
                    <input type="radio" v-model="selectedPaymentMethod" value="MANDIRI_VA" class="accent-forest" />
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                        <IconBank :size="18" />
                      </div>
                      <div>
                        <p class="font-extrabold text-xs text-theme-primary">Mandiri Virtual Account</p>
                        <p class="text-[10px] text-stone-500">Verifikasi instan via Livin' by Mandiri</p>
                      </div>
                    </div>
                  </div>
                </label>

                <!-- BRI Virtual Account -->
                <label
                  :class="[
                    'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedPaymentMethod === 'BRI_VA'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center gap-3.5">
                    <input type="radio" v-model="selectedPaymentMethod" value="BRI_VA" class="accent-forest" />
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                        <IconBank :size="18" />
                      </div>
                      <div>
                        <p class="font-extrabold text-xs text-theme-primary">BRI Virtual Account (BRIVA)</p>
                        <p class="text-[10px] text-stone-500">Verifikasi instan via BRImo / ATM</p>
                      </div>
                    </div>
                  </div>
                </label>

                <!-- Credit Card -->
                <label
                  :class="[
                    'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all',
                    selectedPaymentMethod === 'CREDIT_CARD'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 shadow-sm'
                      : 'border-theme-border hover:bg-stone-50 dark:hover:bg-stone-900'
                  ]"
                >
                  <div class="flex items-center gap-3.5">
                    <input type="radio" v-model="selectedPaymentMethod" value="CREDIT_CARD" class="accent-forest" />
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center">
                        <IconCreditCard :size="18" />
                      </div>
                      <div>
                        <p class="font-extrabold text-xs text-theme-primary">Kartu Kredit / Debit Online</p>
                        <p class="text-[10px] text-stone-500">Visa, Mastercard, JCB (3D-Secure)</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Terms & Conditions Checkbox -->
              <div
                :class="[
                  'pt-3 border-t p-2 rounded-xl transition-all',
                  showValidationErrors && !agreeTerms
                    ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
                    : 'border-theme-border'
                ]"
              >
                <label class="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 dark:text-stone-300">
                  <input type="checkbox" v-model="agreeTerms" class="mt-0.5 accent-forest rounded" />
                  <span>
                    Saya menyetujui <strong class="text-theme-primary">Syarat & Ketentuan Sewa</strong>, kewajiban menjaga kondisi unit, dan ketentuan pengembalian deposit amanah di e-punyasewa.
                  </span>
                </label>
                <p v-if="showValidationErrors && !agreeTerms" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 mt-1 pl-6">
                  * Anda wajib menyetujui syarat & ketentuan sewa untuk melanjutkan.
                </p>
              </div>

              <!-- Submit Button -->
              <BaseButton
                @click="handleProceedToPayment"
                :loading="isSubmitting"
                variant="primary"
                size="lg"
                class="w-full mt-4"
              >
                <span>Lanjut ke Instruksi Pembayaran</span>
                <IconArrowRight :size="16" />
              </BaseButton>
            </div>
          </template>

          <!-- STEP 2: INTERACTIVE PAYMENT GATEWAY TERMINAL -->
          <template v-else-if="checkoutStep === 2 && currentOrder">
            <div class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-card space-y-6">
              
              <!-- Countdown Expiry Timer -->
              <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                  <IconClock :size="18" class="animate-spin" style="animation-duration: 4s;" />
                  <span class="text-xs font-bold">Selesaikan Pembayaran Dalam:</span>
                </div>
                <span class="font-mono font-black text-sm sm:text-base text-amber-700 dark:text-amber-400">
                  {{ formattedCountdown }}
                </span>
              </div>

              <!-- QRIS TERMINAL -->
              <div v-if="currentOrder.paymentMethod === 'QRIS'" class="text-center space-y-4">
                <div>
                  <span class="text-xs font-black uppercase tracking-wider text-forest dark:text-forest-glow">
                    Scan QRIS Dinamis
                  </span>
                  <h3 class="text-base sm:text-lg font-extrabold text-theme-primary mt-1">
                    Buka Aplikasi Pembayaran & Scan Kode QR
                  </h3>
                </div>

                <!-- Simulated High-Res QRIS Code Card -->
                <div class="inline-block p-4 bg-white rounded-3xl border-2 border-stone-200 shadow-xl mx-auto">
                  <div class="w-56 h-56 bg-stone-900 rounded-2xl p-3 flex flex-col items-center justify-between text-white relative">
                    <!-- Top QRIS Logo Header -->
                    <div class="w-full flex items-center justify-between border-b border-white/20 pb-1.5 text-[10px] font-black tracking-widest text-emerald-400">
                      <span>QRIS RESMI</span>
                      <span>NMID: ID1020268842</span>
                    </div>

                    <!-- Inner SVG Graphic representing QR -->
                    <div class="my-auto">
                      <IconQrcode :size="110" class="text-white" />
                    </div>

                    <!-- Bottom Merchant Info -->
                    <div class="w-full text-center border-t border-white/20 pt-1.5">
                      <p class="text-[10px] font-extrabold truncate">e-punyasewa Indonesia</p>
                      <p class="text-[9px] text-stone-400 font-mono">{{ currentOrder.id }}</p>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-stone-500 max-w-sm mx-auto">
                  Dapat discan menggunakan aplikasi: BCA Mobile, Livin' by Mandiri, GoPay, OVO, Dana, ShopeePay, LinkAja.
                </p>
              </div>

              <!-- VIRTUAL ACCOUNT TERMINAL -->
              <div v-else-if="currentOrder.vaNumber" class="space-y-4">
                <div>
                  <span class="text-xs font-black uppercase tracking-wider text-forest dark:text-forest-glow">
                    Nomor Virtual Account
                  </span>
                  <h3 class="text-base sm:text-lg font-extrabold text-theme-primary mt-1">
                    {{ currentOrder.paymentMethodLabel }}
                  </h3>
                </div>

                <!-- VA Number Display Box -->
                <div class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-stone-500 font-bold uppercase block">Nomor Pembayaran (VA)</span>
                    <span class="font-mono text-lg sm:text-xl font-black text-theme-primary tracking-wider">
                      {{ currentOrder.vaNumber }}
                    </span>
                  </div>
                  <button
                    @click="copyText(currentOrder.vaNumber!, 'va')"
                    class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-forest text-white hover:bg-forest-hover transition cursor-pointer"
                  >
                    <IconCopy :size="13" />
                    <span>{{ copiedField === 'va' ? 'Tersalin ✓' : 'Salin' }}</span>
                  </button>
                </div>

                <!-- Total Amount Box -->
                <div class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-stone-500 font-bold uppercase block">Total yang Harus Ditransfer</span>
                    <span class="text-base sm:text-lg font-black text-forest dark:text-forest-glow">
                      {{ formatRupiah(currentOrder.pricing.grandTotal) }}
                    </span>
                  </div>
                  <button
                    @click="copyText(String(currentOrder.pricing.grandTotal), 'nominal')"
                    class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-stone-200 dark:bg-stone-800 text-theme-primary hover:bg-stone-300 transition cursor-pointer"
                  >
                    <IconCopy :size="13" />
                    <span>{{ copiedField === 'nominal' ? 'Tersalin ✓' : 'Salin Nominal' }}</span>
                  </button>
                </div>
              </div>

              <!-- SIMULATE PAYMENT BUTTON (Actionable Testing) -->
              <div class="pt-6 border-t border-theme-border space-y-3">
                <BaseButton
                  @click="simulatePaymentSuccess"
                  :loading="isSubmitting"
                  variant="primary"
                  size="lg"
                  class="w-full text-xs sm:text-sm font-black"
                >
                  <IconCheck :size="16" class="shrink-0" />
                  <span>Konfirmasi Pembayaran Selesai</span>
                </BaseButton>

                <button
                  @click="checkoutStep = 1"
                  class="w-full py-2.5 text-center text-xs font-bold text-stone-500 hover:text-theme-primary rounded-full transition cursor-pointer"
                >
                  ← Ganti Metode Pembayaran Lain
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Right: Sticky Order Summary & Protection Badges (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-theme-card rounded-3xl border border-theme-border p-6 shadow-card space-y-5 sticky top-24">
            <h3 class="font-extrabold text-sm sm:text-base text-theme-primary border-b border-theme-border pb-3">
              Ringkasan Unit Sewa ({{ (currentOrder?.items || cartItems).length }} Item)
            </h3>

            <!-- Item Rows Snapshot -->
            <div class="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              <template v-if="currentOrder && currentOrder.items && currentOrder.items.length > 0">
                <div
                  v-for="item in currentOrder.items"
                  :key="item.productId"
                  class="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border"
                >
                  <img
                    :src="item.primaryImage"
                    :alt="item.productName"
                    class="w-12 h-12 rounded-xl object-cover border border-theme-border shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-xs text-theme-primary truncate">{{ item.productName }}</p>
                    <p class="text-[10px] text-forest dark:text-forest-glow font-semibold mt-0.5">
                      {{ formatDateToIndonesian(new Date(item.startDate)) }} - {{ formatDateToIndonesian(new Date(item.endDate)) }}
                      <span class="text-stone-500 font-normal">({{ item.rentalDays }} Hari)</span>
                    </p>
                    <p class="text-[10px] text-stone-500">Qty: {{ item.quantity }}x</p>
                  </div>
                  <span class="font-black text-xs text-theme-primary">{{ formatRupiah(item.totalAmount) }}</span>
                </div>
              </template>
              <template v-else>
                <div
                  v-for="item in cartItems"
                  :key="item.id"
                  class="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border"
                >
                  <img
                    :src="item.product.primaryImage"
                    :alt="item.product.name"
                    class="w-12 h-12 rounded-xl object-cover border border-theme-border shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-xs text-theme-primary truncate">{{ item.product.name }}</p>
                    <p class="text-[10px] text-forest dark:text-forest-glow font-semibold mt-0.5">
                      {{ formatDateToIndonesian(item.dateRange.startDate) }} - {{ formatDateToIndonesian(item.dateRange.endDate) }}
                      <span class="text-stone-500 font-normal">({{ item.dateRange.durationDays }} Hari)</span>
                    </p>
                    <p class="text-[10px] text-stone-500">Qty: {{ item.quantity }}x</p>
                  </div>
                  <span class="font-black text-xs text-theme-primary">{{ item.totalRentalAmount.format() }}</span>
                </div>
              </template>
            </div>

            <!-- Detailed Cost Breakdown -->
            <div class="space-y-2 pt-3 border-t border-theme-border text-xs">
              <div class="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal Tarif Sewa Unit</span>
                <span class="font-bold text-theme-primary">
                  {{ currentOrder ? formatRupiah(currentOrder.pricing.subtotalRental) : subtotalRental.format() }}
                </span>
              </div>

              <div class="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Ongkos Serah Terima ({{ (currentOrder?.customer.deliveryMethod || deliveryMethod) === 'DELIVERY' ? 'Kurir Khusus' : 'Ambil di Hub' }})</span>
                <span class="font-bold text-theme-primary">
                  {{ (currentOrder?.customer.deliveryMethod || deliveryMethod) === 'DELIVERY' ? (currentOrder ? formatRupiah(currentOrder.pricing.deliveryFee) : estimatedDeliveryFee.format()) : 'Gratis (Rp 0)' }}
                </span>
              </div>

              <div class="flex justify-between items-center text-stone-600 dark:text-stone-400">
                <span class="flex items-center gap-1">
                  <span>Deposit Jaminan</span>
                  <span class="text-[10px] text-stone-400 font-normal">(100% Refundable)</span>
                </span>
                <div class="text-right">
                  <span v-if="currentOrder ? currentOrder.pricing.isDepositWaived : currentUser?.isKycVerified" class="font-extrabold text-emerald-600 dark:text-emerald-400">
                    Bebas Deposit (Rp 0)
                  </span>
                  <span v-else class="font-bold text-theme-primary">
                    {{ currentOrder ? formatRupiah(currentOrder.pricing.totalDeposit) : totalDeposit.format() }}
                  </span>
                </div>
              </div>

              <!-- Grand Total -->
              <div class="pt-3 border-t border-theme-border flex items-baseline justify-between">
                <div>
                  <span class="text-xs uppercase font-extrabold text-stone-500 block">Total Pembayaran</span>
                  <span class="text-[10px] text-stone-400 font-light">Termasuk sewa + deposit</span>
                </div>
                <span class="font-black text-lg sm:text-xl text-forest dark:text-forest-glow">
                  {{ currentOrder ? formatRupiah(currentOrder.pricing.grandTotal) : formatRupiah(effectiveGrandTotal) }}
                </span>
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/70 border border-theme-border space-y-2 text-[11px] text-stone-600 dark:text-stone-400">
              <div class="flex items-center gap-2">
                <IconShieldCheck :size="15" class="text-forest dark:text-forest-glow shrink-0" />
                <span>Deposit dikembalikan 100% setelah unit kembali baik.</span>
              </div>
              <div class="flex items-center gap-2">
                <IconCheck :size="15" class="text-forest dark:text-forest-glow shrink-0" />
                <span>QC & sterilisasi unit 100% sebelum pengiriman.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <AppFooter />
  </div>
</template>
