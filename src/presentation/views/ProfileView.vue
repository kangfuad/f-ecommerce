<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/presentation/composables/useAuth'
import { useToast } from '@/presentation/composables/useToast'
import { formatDateToIndonesian } from '@/core/utils/date'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import {
  IconShieldCheck,
  IconCheck,
  IconLocation,
  IconClose,
  IconArrowRight,
  IconDeliveryTruck,
  IconStar,
  IconBoxPackage,
  IconEdit,
} from '@/presentation/components/icons'

import { MemberTierService, type MemberTierDto } from '@/infrastructure/services/api/MemberTierService'
import SearchableSelect, { type SelectOption } from '@/presentation/components/common/SearchableSelect.vue'
import CascadingRegionSelect from '@/presentation/components/common/CascadingRegionSelect.vue'

const router = useRouter()
const {
  currentUser,
  isLoggedIn,
  openLoginModal,
  updateProfile,
  submitKycVerification,
  approveKycVerification,
  resetKycVerification,
  addSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
} = useAuth()
const { showToast } = useToast()

// Active Tab
const activeTab = ref<'account' | 'kyc' | 'addresses'>('account')

// Dynamic Tiers Data
const memberTiers = ref<MemberTierDto[]>([])
const tiersDisclaimer = ref<string>('')
const isLoadingTiers = ref(false)

// Edit Profile Form State
const isEditProfileModalOpen = ref(false)
const editFullName = ref('')
const editDisplayName = ref('')
const editEmail = ref('')
const editPhone = ref('')
const editAddress = ref('')
const editPostalCode = ref('')
const editEmergencyContactName = ref('')
const editEmergencyPhone = ref('')
const editEmergencyRelation = ref('Pasangan')
const editProfession = ref('')
const editCompanyOrStudio = ref('')
const editSocialMediaInstagram = ref('')
const editProvinceId = ref('31')
const editProvinceName = ref('DKI JAKARTA')
const editRegencyId = ref('3171')
const editRegencyName = ref('KOTA JAKARTA SELATAN')
const editDistrictId = ref('3171060')
const editDistrictName = ref('KEBAYORAN BARU')
const editVillageId = ref('3171060008')
const editVillageName = ref('SELONG')
const editCity = ref('Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta')
const editBio = ref('')

// KYC Form State
const kycIdType = ref<'KTP' | 'SIM' | 'PASPOR'>('KTP')
const kycIdNumber = ref('')
const kycFullName = ref('')
const kycPhotoPreview = ref<string | null>(null)
const isSubmittingKyc = ref(false)
const isEditingKyc = ref(false)

// Address Form State
const isAddAddressModalOpen = ref(false)
const addrLabel = ref('Rumah')
const addrRecipient = ref('')
const addrPhone = ref('')
const addrProvinceId = ref('31')
const addrProvinceName = ref('DKI JAKARTA')
const addrRegencyId = ref('3171')
const addrRegencyName = ref('KOTA JAKARTA SELATAN')
const addrDistrictId = ref('3171060')
const addrDistrictName = ref('KEBAYORAN BARU')
const addrVillageId = ref('3171060008')
const addrVillageName = ref('SELONG')
const addrCity = ref('Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta')
const addrFull = ref('')
const addrPostalCode = ref('')
const addrIsDefault = ref(false)

watch(
  isLoggedIn,
  (val) => {
    if (!val) {
      router.replace('/')
    }
  }
)

async function loadTiersData() {
  isLoadingTiers.value = true
  try {
    const res = await MemberTierService.getMemberTiers()
    if (res.status === 'success' && res.data) {
      memberTiers.value = res.data.data
      tiersDisclaimer.value = res.data.disclaimer
    }
  } catch {
    // fallback gracefully
  } finally {
    isLoadingTiers.value = false
  }
}

onMounted(() => {
  loadTiersData()

  if (!isLoggedIn.value) {
    openLoginModal()
    router.replace('/')
    return
  }

  if (currentUser.value) {
    editFullName.value = currentUser.value.fullName
    editDisplayName.value = currentUser.value.displayName || currentUser.value.fullName
    editEmail.value = currentUser.value.email
    editPhone.value = currentUser.value.phone
    editAddress.value = currentUser.value.address || ''
    editProvinceId.value = currentUser.value.provinceId || '31'
    editProvinceName.value = currentUser.value.provinceName || 'DKI JAKARTA'
    editRegencyId.value = currentUser.value.regencyId || '3171'
    editRegencyName.value = currentUser.value.regencyName || 'KOTA JAKARTA SELATAN'
    editDistrictId.value = currentUser.value.districtId || '3171060'
    editDistrictName.value = currentUser.value.districtName || 'KEBAYORAN BARU'
    editVillageId.value = currentUser.value.villageId || '3171060008'
    editVillageName.value = currentUser.value.villageName || 'SELONG'
    editCity.value = currentUser.value.city || 'Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta'
    editPostalCode.value = currentUser.value.postalCode || ''
    editEmergencyContactName.value = currentUser.value.emergencyContactName || ''
    editEmergencyPhone.value = currentUser.value.emergencyPhone || ''
    editEmergencyRelation.value = currentUser.value.emergencyRelation || 'Pasangan'
    editProfession.value = currentUser.value.profession || ''
    editCompanyOrStudio.value = currentUser.value.companyOrStudio || ''
    editSocialMediaInstagram.value = currentUser.value.socialMediaInstagram || ''
    editBio.value = currentUser.value.bio || ''

    kycFullName.value = currentUser.value.fullName
    if (currentUser.value.idNumber) {
      kycIdNumber.value = currentUser.value.idNumber
    }
    if (currentUser.value.idPhotoUrl) {
      kycPhotoPreview.value = currentUser.value.idPhotoUrl
    }
  }
})

function openEditProfile() {
  if (!currentUser.value) return
  editFullName.value = currentUser.value.fullName
  editDisplayName.value = currentUser.value.displayName || currentUser.value.fullName
  editEmail.value = currentUser.value.email
  editPhone.value = currentUser.value.phone
  editAddress.value = currentUser.value.address || ''
  editProvinceId.value = currentUser.value.provinceId || '31'
  editProvinceName.value = currentUser.value.provinceName || 'DKI JAKARTA'
  editRegencyId.value = currentUser.value.regencyId || '3171'
  editRegencyName.value = currentUser.value.regencyName || 'KOTA JAKARTA SELATAN'
  editDistrictId.value = currentUser.value.districtId || '3171060'
  editDistrictName.value = currentUser.value.districtName || 'KEBAYORAN BARU'
  editVillageId.value = currentUser.value.villageId || '3171060008'
  editVillageName.value = currentUser.value.villageName || 'SELONG'
  editCity.value = currentUser.value.city || 'Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta'
  editPostalCode.value = currentUser.value.postalCode || ''
  editEmergencyContactName.value = currentUser.value.emergencyContactName || ''
  editEmergencyPhone.value = currentUser.value.emergencyPhone || ''
  editEmergencyRelation.value = currentUser.value.emergencyRelation || 'Pasangan'
  editProfession.value = currentUser.value.profession || ''
  editCompanyOrStudio.value = currentUser.value.companyOrStudio || ''
  editSocialMediaInstagram.value = currentUser.value.socialMediaInstagram || ''
  editBio.value = currentUser.value.bio || ''
  isEditProfileModalOpen.value = true
}

function handleSaveProfile() {
  if (!editFullName.value.trim() || !editPhone.value.trim()) {
    showToast({ type: 'warning', title: 'Data Belum Lengkap', message: 'Nama lengkap dan nomor WhatsApp wajib diisi.' })
    return
  }

  updateProfile({
    fullName: editFullName.value.trim(),
    displayName: editDisplayName.value.trim() || editFullName.value.trim(),
    phone: editPhone.value.trim(),
    address: editAddress.value.trim(),
    provinceId: editProvinceId.value,
    provinceName: editProvinceName.value,
    regencyId: editRegencyId.value,
    regencyName: editRegencyName.value,
    districtId: editDistrictId.value,
    districtName: editDistrictName.value,
    villageId: editVillageId.value,
    villageName: editVillageName.value,
    postalCode: editPostalCode.value.trim(),
    emergencyContactName: editEmergencyContactName.value.trim(),
    emergencyPhone: editEmergencyPhone.value.trim(),
    emergencyRelation: editEmergencyRelation.value,
    profession: editProfession.value.trim(),
    companyOrStudio: editCompanyOrStudio.value.trim(),
    socialMediaInstagram: editSocialMediaInstagram.value.trim(),
    city: editCity.value,
    bio: editBio.value.trim(),
  })

  isEditProfileModalOpen.value = false
  showToast({
    type: 'success',
    title: 'Profil Lengkap Diperbarui',
    message: 'Data identitas, alamat domisili, kontak darurat, dan profil profesi Anda berhasil disimpan.',
  })
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast({ type: 'error', title: 'File Terlalu Besar', message: 'Ukuran foto maksimal 5 MB.' })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    kycPhotoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleKycSubmit() {
  if (!kycIdNumber.value.trim() || kycIdNumber.value.trim().length < 6) {
    showToast({ type: 'warning', title: 'Data Tidak Valid', message: 'Masukkan nomor identitas yang valid.' })
    return
  }
  if (!kycPhotoPreview.value) {
    showToast({ type: 'warning', title: 'Foto Wajib Diunggah', message: 'Silakan unggah foto e-KTP / SIM Anda.' })
    return
  }

  isSubmittingKyc.value = true
  try {
    await submitKycVerification({
      idType: kycIdType.value,
      idNumber: kycIdNumber.value.trim(),
      idPhotoUrl: kycPhotoPreview.value,
    })
    isEditingKyc.value = false
    showToast({
      type: 'success',
      title: 'Dokumen Berhasil Dikirim!',
      message: 'Dokumen identitas Anda sedang diproses oleh administrator (Estimasi: 15-30 menit).',
      duration: 6000,
    })
    activeTab.value = 'kyc'
  } catch (err: any) {
    showToast({ type: 'error', title: 'Gagal Mengirim Dokumen', message: err.message || 'Terjadi kesalahan sistem.' })
  } finally {
    isSubmittingKyc.value = false
  }
}

async function handleSimulateAdminApprove() {
  await approveKycVerification()
  showToast({
    type: 'success',
    title: 'KYC Disetujui Administrator!',
    message: 'Selamat! Akun Anda kini Verified Gold. Fasilitas Bebas Deposit Rp 0 aktif permanen.',
    duration: 5000,
  })
}

function handleResetKyc() {
  resetKycVerification()
  isEditingKyc.value = false
  showToast({
    type: 'info',
    title: 'Status KYC Direset',
    message: 'Status akun dikembalikan ke Starter (Belum Verifikasi).',
  })
}

function handleAddAddressSubmit() {
  if (!addrRecipient.value.trim() || !addrPhone.value.trim() || !addrFull.value.trim()) {
    showToast({ type: 'warning', title: 'Data Belum Lengkap', message: 'Semua kolom alamat wajib diisi.' })
    return
  }

  addSavedAddress({
    label: addrLabel.value,
    recipientName: addrRecipient.value.trim(),
    phone: addrPhone.value.trim(),
    provinceId: addrProvinceId.value,
    provinceName: addrProvinceName.value,
    regencyId: addrRegencyId.value,
    regencyName: addrRegencyName.value,
    districtId: addrDistrictId.value,
    districtName: addrDistrictName.value,
    villageId: addrVillageId.value,
    villageName: addrVillageName.value,
    city: addrCity.value,
    fullAddress: addrFull.value.trim(),
    postalCode: addrPostalCode.value.trim(),
    isDefault: addrIsDefault.value,
  })

  isAddAddressModalOpen.value = false
  addrFull.value = ''
  addrPostalCode.value = ''
  showToast({ type: 'success', title: 'Alamat Tersimpan', message: 'Alamat pengiriman baru berhasil ditambahkan.' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      <!-- Unauthenticated Fallback -->
      <div v-if="!isLoggedIn || !currentUser" class="text-center py-20 bg-theme-card rounded-3xl border border-theme-border p-8 animate-fade-up">
        <div class="w-16 h-16 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow border border-forest/20 flex items-center justify-center mx-auto mb-4">
          <IconShieldCheck :size="32" />
        </div>
        <h2 class="font-display text-2xl font-black text-theme-primary">Akses Khusus Member</h2>
        <p class="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-2">
          Silakan masuk ke akun e-punyasewa Anda untuk mengelola profil dan verifikasi KYC.
        </p>
        <button
          @click="openLoginModal"
          class="mt-6 px-6 py-2.5 bg-[#244E33] hover:bg-[#1B3B26] text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition"
        >
          Masuk ke Akun Anda
        </button>
      </div>

      <!-- Authenticated Profile View -->
      <div v-else class="space-y-6">
        
        <!-- Profile Header Banner -->
        <div class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div class="flex items-start sm:items-center gap-4 sm:gap-5">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-forest dark:bg-emerald-600 text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-black shadow-md border-2 border-white/20 shrink-0 mt-1 sm:mt-0">
              {{ currentUser.initials }}
            </div>
            <div class="min-w-0 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="font-display text-xl sm:text-2xl font-black text-theme-primary truncate">
                  {{ currentUser.fullName }}
                </h1>
                <span
                  :class="[
                    'text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0',
                    currentUser.tierBadge.classes
                  ]"
                >
                  {{ currentUser.tierBadge.label }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0',
                    currentUser.kycBadge.classes
                  ]"
                >
                  {{ currentUser.kycBadge.label }}
                </span>
              </div>

              <!-- Professional & Studio Tag -->
              <p v-if="currentUser.profession" class="text-xs font-bold text-forest dark:text-forest-glow flex items-center gap-1.5 flex-wrap">
                <span>{{ currentUser.profession }}</span>
                <span v-if="currentUser.companyOrStudio" class="text-stone-400 font-normal"> • {{ currentUser.companyOrStudio }}</span>
                <span v-if="currentUser.socialMediaInstagram" class="text-stone-500 font-semibold"> ({{ currentUser.socialMediaInstagram }})</span>
              </p>

              <!-- Contacts & Location Details -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 font-medium">
                <span class="flex items-center gap-1.5 text-theme-primary">
                  <svg class="w-3.5 h-3.5 text-forest dark:text-forest-glow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{{ currentUser.email }}</span>
                </span>
                <span class="text-stone-300 dark:text-stone-700">•</span>
                <span class="flex items-center gap-1.5 text-theme-primary">
                  <svg class="w-3.5 h-3.5 text-forest dark:text-forest-glow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ currentUser.phone }}</span>
                </span>
                <span v-if="currentUser.address || currentUser.city" class="text-stone-300 dark:text-stone-700">•</span>
                <span v-if="currentUser.address || currentUser.city" class="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                  <IconLocation :size="12" class="text-forest dark:text-forest-glow shrink-0" />
                  <span class="truncate max-w-xs">{{ currentUser.address ? `${currentUser.address}, ${currentUser.city || ''}` : currentUser.city }}</span>
                </span>
              </div>

              <!-- Emergency Contact Info -->
              <div v-if="currentUser.emergencyContactName" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                <span class="font-bold">Kontak Darurat:</span>
                <span>{{ currentUser.emergencyContactName }} ({{ currentUser.emergencyRelation || 'Kerabat' }})</span>
                <span v-if="currentUser.emergencyPhone">• {{ currentUser.emergencyPhone }}</span>
              </div>

              <!-- Bio quote if present -->
              <p v-if="currentUser.bio" class="text-[11px] text-stone-600 dark:text-stone-300 italic max-w-xl line-clamp-1">
                "{{ currentUser.bio }}"
              </p>

              <p class="text-[11px] text-stone-500 dark:text-stone-300 font-medium pt-0.5">
                Bergabung sejak: <span class="font-bold text-theme-primary">{{ formatDateToIndonesian(currentUser.joinedAt) }}</span>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              @click="openEditProfile"
              class="flex-1 md:flex-none px-5 py-2.5 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5"
            >
              <IconEdit :size="13" />
              <span>Ubah Data Akun</span>
            </button>
            <router-link
              to="/pesanan-saya"
              class="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-sm transition"
            >
              <IconDeliveryTruck :size="14" />
              <span>Riwayat Sewa</span>
            </router-link>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-theme-border pb-3 overflow-x-auto custom-scrollbar">
          <button
            @click="activeTab = 'account'"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
              activeTab === 'account'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'border-theme-border bg-theme-card text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            Member Tier & Keuntungan
          </button>

          <button
            @click="activeTab = 'kyc'"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0 flex items-center gap-1.5',
              activeTab === 'kyc'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'border-theme-border bg-theme-card text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            <IconShieldCheck :size="14" />
            <span>Verifikasi Identitas (KYC)</span>
            <span v-if="currentUser.isKycVerified" class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span v-else-if="currentUser.kycStatus === 'PENDING_REVIEW'" class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </button>

          <button
            @click="activeTab = 'addresses'"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0 flex items-center gap-1.5',
              activeTab === 'addresses'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'border-theme-border bg-theme-card text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            <IconLocation :size="14" />
            <span>Buku Alamat Pengiriman ({{ currentUser.savedAddresses.length }})</span>
          </button>
        </div>

        <!-- TAB 1: Member Tier & Account Overview -->
        <div v-if="activeTab === 'account'" class="space-y-8 animate-fade-up">
          
          <!-- Active Member Tier Hero Card (Dynamic Light & Dark Theme) -->
          <div class="bg-gradient-to-br from-emerald-50/90 via-white to-stone-100/90 dark:from-stone-900 dark:via-stone-950 dark:to-[#14261B] text-theme-primary dark:text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/20 dark:border-stone-800 shadow-xl space-y-6 transition-all duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border dark:border-white/10 pb-5">
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-forest dark:text-emerald-400">
                    Tingkatan Keanggotaan Aktif
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    Akun Terverifikasi
                  </span>
                </div>
                <h2 class="font-display text-2xl sm:text-3xl md:text-4xl font-black text-theme-primary dark:text-white tracking-tight">
                  {{ currentUser.tierLabel }}
                </h2>
                <p class="text-xs sm:text-sm text-forest dark:text-emerald-300 font-bold">
                  Fasilitas Bebas Deposit 100% (Rp 0) aktif pada akun Anda.
                </p>
              </div>

              <div class="text-left sm:text-right p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 shrink-0 shadow-xs">
                <p class="text-xs text-stone-600 dark:text-stone-300 font-medium">Riwayat Transaksi</p>
                <p class="text-xl sm:text-2xl font-black text-forest dark:text-emerald-400 mt-0.5">{{ currentUser.rentalCount }} Kali Sewa</p>
                <p class="text-[10px] text-stone-500 dark:text-stone-300 mt-0.5 font-medium">Catatan Pengembalian: 100% Tepat Waktu</p>
              </div>
            </div>

            <!-- Active Perks Grid (Large & High Contrast) -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Keuntungan Eksklusif Tingkat Anda Saat Ini:
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/5 border border-theme-border dark:border-white/10 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-white/10 transition shadow-xs">
                  <div class="w-10 h-10 rounded-xl bg-forest/10 dark:bg-emerald-500/20 text-forest dark:text-emerald-300 flex items-center justify-center font-black text-xs shadow-sm">
                    Rp 0
                  </div>
                  <h4 class="font-extrabold text-sm sm:text-base text-theme-primary dark:text-white">Bebas Deposit 100%</h4>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
                    Sewa kamera sinema dan drone premium tanpa perlu menahan dana deposit sepeser pun.
                  </p>
                </div>

                <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/5 border border-theme-border dark:border-white/10 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-white/10 transition shadow-xs">
                  <div class="w-10 h-10 rounded-xl bg-forest/10 dark:bg-emerald-500/20 text-forest dark:text-emerald-300 flex items-center justify-center shadow-sm">
                    <IconCheck :size="20" />
                  </div>
                  <h4 class="font-extrabold text-sm sm:text-base text-theme-primary dark:text-white">Prioritas QC & Sterilisasi</h4>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
                    Unit diperiksa dan disiapkan lebih awal oleh teknisi senior sebelum jadwal syuting Anda.
                  </p>
                </div>

                <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/5 border border-theme-border dark:border-white/10 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-white/10 transition shadow-xs">
                  <div class="w-10 h-10 rounded-xl bg-forest/10 dark:bg-emerald-500/20 text-forest dark:text-emerald-300 flex items-center justify-center shadow-sm">
                    <IconDeliveryTruck :size="20" />
                  </div>
                  <h4 class="font-extrabold text-sm sm:text-base text-theme-primary dark:text-white">Kurir Terdedikasi</h4>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
                    Pengantaran langsung ke lokasi studio/rumah dalam hardcase anti-guncangan bersertifikasi.
                  </p>
                </div>

                <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/5 border border-theme-border dark:border-white/10 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-white/10 transition shadow-xs">
                  <div class="w-10 h-10 rounded-xl bg-forest/10 dark:bg-emerald-500/20 text-forest dark:text-emerald-300 flex items-center justify-center shadow-sm">
                    <IconStar :size="20" />
                  </div>
                  <h4 class="font-extrabold text-sm sm:text-base text-theme-primary dark:text-white">Support CS WhatsApp VIP</h4>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
                    Respon konsultasi teknis cepat dan kemudahan proses perpanjangan masa sewa alat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: All Member Tiers Guide & Comparison (Fetched dynamically from JSON) -->
          <div class="space-y-4">
            <div>
              <span class="text-[11px] font-black uppercase tracking-widest text-forest dark:text-forest-glow">
                Panduan Lengkap Tingkatan Member
              </span>
              <h2 class="font-display text-xl sm:text-2xl font-black text-theme-primary mt-0.5">
                Kualifikasi & Perbandingan Keuntungan
              </h2>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl leading-relaxed font-medium">
                Pelajari syarat kualifikasi, ketentuan dana deposit, dan cara meningkatkan level akun Anda untuk mendapatkan fasilitas rental terbaik.
              </p>
            </div>

            <!-- 3 Columns Tiers Comparison Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div
                v-for="tier in memberTiers"
                :key="tier.id"
                :class="[
                  'bg-theme-card rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-sm relative',
                  currentUser.memberTier === tier.id || (currentUser.isKycVerified && tier.id === 'VERIFIED_GOLD')
                    ? 'border-forest dark:border-emerald-500/60 ring-2 ring-forest/20'
                    : 'border-theme-border hover:border-forest/40'
                ]"
              >
                <!-- Active Indicator Banner -->
                <div
                  v-if="currentUser.memberTier === tier.id || (currentUser.isKycVerified && tier.id === 'VERIFIED_GOLD')"
                  class="absolute -top-3 left-6 bg-forest text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1"
                >
                  <IconCheck :size="10" class="stroke-[3]" />
                  <span>Tingkat Akun Anda Saat Ini</span>
                </div>

                <div class="space-y-4 pt-1">
                  <!-- Tier Header -->
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span
                        :class="[
                          'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border',
                          tier.badgeTheme === 'emerald' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                          tier.badgeTheme === 'purple' && 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
                          tier.badgeTheme === 'stone' && 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-theme-border'
                        ]"
                      >
                        {{ tier.badge }}
                      </span>
                      <span v-if="tier.isPopular" class="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                        <IconStar :size="10" class="fill-current" />
                        <span>Populer</span>
                      </span>
                    </div>

                    <h3 class="font-display font-black text-lg sm:text-xl text-theme-primary pt-1">
                      {{ tier.name }}
                    </h3>
                    <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                      {{ tier.tagline }}
                    </p>
                  </div>

                  <!-- Qualification Box -->
                  <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border space-y-1 text-xs">
                    <span class="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 block tracking-wider">
                      Syarat & Kualifikasi:
                    </span>
                    <p class="text-xs text-theme-primary font-semibold leading-relaxed">
                      {{ tier.qualification }}
                    </p>
                  </div>

                  <!-- Deposit Status Badge -->
                  <div class="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 flex items-center justify-between text-xs">
                    <span class="text-stone-600 dark:text-stone-300 font-medium">Fasilitas Deposit:</span>
                    <strong class="text-forest dark:text-emerald-300 font-black">{{ tier.depositRequirement }}</strong>
                  </div>

                  <!-- Perks List -->
                  <div class="space-y-3 pt-2">
                    <span class="text-[11px] font-black uppercase tracking-wider text-theme-primary block">
                      Fasilitas & Keuntungan:
                    </span>
                    <div class="space-y-2.5">
                      <div
                        v-for="(perk, idx) in tier.perks"
                        :key="idx"
                        class="flex items-start gap-2.5 text-xs text-theme-primary leading-relaxed"
                      >
                        <IconCheck :size="15" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
                        <div>
                          <strong class="font-bold block text-theme-primary">{{ perk.title }}</strong>
                          <span class="text-stone-600 dark:text-stone-300 font-normal">{{ perk.desc }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer / How to Upgrade Action -->
                <div class="pt-5 mt-5 border-t border-theme-border space-y-2.5">
                  <div class="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    <strong class="text-theme-primary block font-bold mb-0.5">Cara Naik Tingkat:</strong>
                    {{ tier.howToUpgrade }}
                  </div>

                  <button
                    v-if="tier.id === 'STARTER' && !currentUser.isKycVerified"
                    @click="activeTab = 'kyc'"
                    class="w-full py-2.5 bg-forest text-white rounded-full text-xs font-black shadow-sm cursor-pointer hover:bg-forest/90 transition text-center"
                  >
                    Verifikasi KYC Sekarang →
                  </button>
                  <div
                    v-else-if="currentUser.memberTier === tier.id || (currentUser.isKycVerified && tier.id === 'VERIFIED_GOLD')"
                    class="w-full py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-black text-center border border-emerald-500/20"
                  >
                    Tingkat Aktif Anda
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Section 3: Disclaimer & Regulasi Transparansi -->
          <div class="bg-theme-card rounded-3xl border border-theme-border p-5 sm:p-6 shadow-xs flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow flex items-center justify-center shrink-0 mt-0.5">
              <IconShieldCheck :size="20" />
            </div>
            <div class="space-y-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              <h4 class="font-extrabold text-theme-primary text-xs sm:text-sm">
                Disclaimer & Kebijakan Keanggotaan e-punyasewa
              </h4>
              <p class="font-normal text-stone-500 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
                {{ tiersDisclaimer || 'Ketentuan dan fasilitas tingkatan keanggotaan dapat disesuaikan sewaktu-waktu oleh manajemen e-punyasewa demi menjaga keamanan aset serta kenyamanan seluruh pelanggan. Fasilitas Bebas Deposit berlaku selama akun memiliki riwayat pemakaian yang baik, tepat waktu, dan mematuhi seluruh syarat ketentuan rental yang berlaku.' }}
              </p>
            </div>
          </div>

        </div>

        <!-- TAB 2: KYC Identity Verification -->
        <div v-if="activeTab === 'kyc'" class="space-y-6 animate-fade-up">
          
          <!-- State A: Already Verified View -->
          <div v-if="currentUser.isKycVerified && !isEditingKyc" class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-card space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-5">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <IconShieldCheck :size="28" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Status Akun Resmi
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                      <IconShieldCheck :size="11" />
                      <span>Terverifikasi (Verified Gold)</span>
                    </span>
                  </div>
                  <h3 class="font-extrabold text-base sm:text-xl text-theme-primary mt-0.5">
                    Identitas Anda Telah Terverifikasi
                  </h3>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-200 mt-1 font-medium leading-relaxed">
                    Fasilitas Bebas Deposit 100% (Rp 0) aktif secara permanen untuk seluruh transaksi sewa.
                  </p>
                </div>
              </div>

              <!-- Button to open editing / re-uploading KYC -->
              <div class="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  @click="isEditingKyc = true"
                  class="px-4 py-2 rounded-full border border-theme-border hover:border-forest/40 bg-stone-50 dark:bg-stone-900 text-xs font-bold text-theme-primary flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <IconEdit :size="13" />
                  <span>Perbarui Dokumen</span>
                </button>
              </div>
            </div>

            <!-- Verified Document Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border text-xs">
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Jenis Dokumen</span>
                <p class="font-extrabold text-theme-primary text-sm">{{ currentUser.idType || 'e-KTP Nasional' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Nomor Identitas (NIK)</span>
                <p class="font-mono font-black text-theme-primary text-sm">{{ currentUser.idNumber || '3174************' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Nama Pemilik Dokumen</span>
                <p class="font-bold text-theme-primary text-sm">{{ currentUser.fullName }}</p>
              </div>
            </div>

            <!-- 3 Key KYC Benefits Highlights -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div class="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 dark:border-emerald-500/30 text-xs space-y-1.5 shadow-2xs">
                <p class="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <IconCheck :size="13" class="stroke-[3] shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Bebas Deposit Rp 0</span>
                </p>
                <p class="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                  Penyewaan langsung tanpa menahan dana jaminan uang tunai.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 dark:border-emerald-500/30 text-xs space-y-1.5 shadow-2xs">
                <p class="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <IconCheck :size="13" class="stroke-[3] shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Fast Track Pick Up</span>
                </p>
                <p class="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                  Serah terima unit di Hub Rental tanpa verifikasi manual ulang.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 dark:border-emerald-500/30 text-xs space-y-1.5 shadow-2xs">
                <p class="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <IconCheck :size="13" class="stroke-[3] shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Akses Cinema Gear</span>
                </p>
                <p class="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                  Izin sewa kamera bioskop & lensa anamorphic kelas profesional.
                </p>
              </div>
            </div>
          </div>

          <!-- State B: Pending Administrator Review State (Verifikasi Sedang Diproses oleh Administrator) -->
          <div v-else-if="currentUser.kycStatus === 'PENDING_REVIEW' && !isEditingKyc" class="bg-theme-card rounded-3xl border border-amber-500/30 dark:border-amber-500/30 p-6 sm:p-8 shadow-card space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-5">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm relative">
                  <IconClock :size="28" class="animate-pulse" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      Status Pengajuan Dokumen
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-500/30 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>Sedang Diproses Administrator</span>
                    </span>
                  </div>
                  <h3 class="font-extrabold text-base sm:text-xl text-theme-primary mt-0.5">
                    Verifikasi Dokumen Sedang Ditinjau oleh Administrator
                  </h3>
                  <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 font-medium leading-relaxed">
                    Dokumen KYC Anda telah kami terima dan sedang dalam proses validasi manual oleh tim verifikasi administrator e-punyasewa.
                  </p>
                </div>
              </div>

              <!-- Action buttons in pending state -->
              <div class="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  @click="isEditingKyc = true"
                  class="px-4 py-2 rounded-full border border-theme-border hover:border-forest/40 bg-stone-50 dark:bg-stone-900 text-xs font-bold text-theme-primary flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <IconEdit :size="13" />
                  <span>Unggah Ulang / Ubah Data</span>
                </button>
              </div>
            </div>

            <!-- 3-Step Visual Progress Tracker -->
            <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/5 via-stone-50 to-emerald-500/5 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-emerald-950/20 border border-theme-border space-y-4">
              <span class="text-[11px] font-black uppercase tracking-wider text-theme-primary block">
                Tahapan Proses Verifikasi Identitas:
              </span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Step 1 -->
                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-emerald-500/30 shadow-2xs">
                  <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <IconCheck :size="14" class="stroke-[3]" />
                  </div>
                  <div class="space-y-0.5">
                    <h5 class="text-xs font-bold text-theme-primary">1. Dokumen Terkirim</h5>
                    <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Berkas berhasil diunggah</p>
                  </div>
                </div>

                <!-- Step 2 -->
                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/40 shadow-2xs relative overflow-hidden">
                  <div class="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs animate-pulse">
                    <IconClock :size="14" />
                  </div>
                  <div class="space-y-0.5">
                    <h5 class="text-xs font-bold text-amber-800 dark:text-amber-300">2. Review Administrator</h5>
                    <p class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Validasi NIK & Kesesuaian Foto</p>
                  </div>
                </div>

                <!-- Step 3 -->
                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/40 dark:bg-stone-900/40 border border-theme-border opacity-70">
                  <div class="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    3
                  </div>
                  <div class="space-y-0.5">
                    <h5 class="text-xs font-bold text-stone-500 dark:text-stone-400">3. Fasilitas Bebas Deposit</h5>
                    <p class="text-[11px] text-stone-400">Status Verified Gold Aktif</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submitted KYC Information Box -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border text-xs">
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Jenis Dokumen</span>
                <p class="font-extrabold text-theme-primary text-sm">{{ currentUser.idType || 'e-KTP Nasional' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Nomor Identitas (NIK)</span>
                <p class="font-mono font-black text-theme-primary text-sm">{{ currentUser.idNumber || '3174************' }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Nama Pemilik Dokumen</span>
                <p class="font-bold text-theme-primary text-sm">{{ currentUser.fullName }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-stone-400 dark:text-stone-400 font-bold block text-[10px] uppercase">Estimasi Waktu Proses</span>
                <p class="font-bold text-amber-700 dark:text-amber-300 text-sm">15 - 30 Menit</p>
              </div>
            </div>

            <!-- Fast-Track Assistance & Demo Controls Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <IconShieldCheck :size="16" />
                </div>
                <div>
                  <p class="font-bold text-theme-primary text-xs">Butuh sewa mendesak hari ini?</p>
                  <p class="text-[11px] text-stone-600 dark:text-stone-300">Hubungi tim verifikasi WhatsApp kami untuk meminta persetujuan prioritas (*Fast-Track Approval*).</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <a
                  :href="`https://wa.me/6281234567890?text=${encodeURIComponent('Halo Tim Admin e-punyasewa, mohon bantu verifikasi dokumen KYC akun saya atas nama ' + currentUser.fullName + ' (NIK: ' + (currentUser.idNumber || '') + ')')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span>Chat WhatsApp Admin</span>
                  <span>→</span>
                </a>

                <!-- Quick Simulator for instant approval in demo -->
                <button
                  type="button"
                  @click="handleSimulateAdminApprove"
                  class="px-4 py-2 rounded-full bg-forest/10 hover:bg-forest/20 text-forest dark:text-forest-glow border border-forest/30 font-bold text-xs cursor-pointer transition"
                  title="Simulasikan persetujuan instan dari admin"
                >
                  <span class="mr-1">⚡</span>
                  <span>Setujui KYC (Demo)</span>
                </button>
              </div>
            </div>

          </div>

          <!-- State C: Unverified OR Editing Form State -->
          <div v-else class="bg-theme-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-card space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-5">
              <div>
                <span class="text-[11px] font-extrabold uppercase tracking-widest text-forest dark:text-forest-glow">
                  Formulir Verifikasi Identitas (KYC)
                </span>
                <h2 class="font-display text-xl sm:text-2xl font-black text-theme-primary mt-0.5">
                  Unggah Dokumen Identitas Resmi
                </h2>
                <p class="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
                  Verifikasi identitas resmi (e-KTP, SIM, atau Paspor) hanya dilakukan 1x untuk mengaktifkan fasilitas **Bebas Deposit 100% (Rp 0)** pada seluruh transaksi rental Anda.
                </p>
              </div>

              <button
                v-if="currentUser.isKycVerified || currentUser.kycStatus === 'PENDING_REVIEW'"
                type="button"
                @click="isEditingKyc = false"
                class="px-4 py-2 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 self-start sm:self-auto cursor-pointer transition flex items-center gap-1"
              >
                <IconClose :size="12" />
                <span>Batal</span>
              </button>
            </div>

            <!-- 2-Column Balanced Grid: Form on Left, Guidelines & Security on Right -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- Form Column (7 cols) -->
              <form @submit.prevent="handleKycSubmit" class="lg:col-span-7 space-y-5">
                <!-- 1. ID Type Selector -->
                <div class="space-y-1.5 text-xs">
                  <label class="font-bold text-theme-primary block">1. Pilih Jenis Dokumen Identitas</label>
                  <div class="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      v-for="type in (['KTP', 'SIM', 'PASPOR'] as const)"
                      :key="type"
                      @click="kycIdType = type"
                      :class="[
                        'py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center',
                        kycIdType === type
                          ? 'bg-forest text-white border-forest shadow-xs'
                          : 'border-theme-border bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:border-forest/40'
                      ]"
                    >
                      {{ type === 'KTP' ? 'e-KTP' : type === 'SIM' ? 'SIM Asli' : 'Paspor RI' }}
                    </button>
                  </div>
                </div>

                <!-- 2 & 3. NIK & Nama Lengkap -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5 text-xs">
                    <label class="font-bold text-theme-primary block">
                      2. Nomor Identitas (NIK / SIM) <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="kycIdNumber"
                      type="text"
                      placeholder="Contoh: 3174012345670001"
                      class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                      required
                    />
                  </div>

                  <div class="space-y-1.5 text-xs">
                    <label class="font-bold text-theme-primary block">
                      3. Nama Lengkap Sesuai Dokumen <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="kycFullName"
                      type="text"
                      placeholder="Nama lengkap sesuai KTP"
                      class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                      required
                    />
                  </div>
                </div>

                <!-- 4. Upload Dropzone -->
                <div class="space-y-1.5 text-xs">
                  <label class="font-bold text-theme-primary block">
                    4. Unggah Foto Fisik Dokumen Asli <span class="text-rose-500">*</span>
                  </label>
                  <div class="border-2 border-dashed border-theme-border rounded-3xl p-6 sm:p-8 text-center bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-100/50 dark:hover:bg-stone-900 transition">
                    
                    <div v-if="kycPhotoPreview" class="space-y-3">
                      <img :src="kycPhotoPreview" alt="Preview Dokumen" class="max-h-52 mx-auto rounded-2xl object-contain border border-theme-border shadow-md" />
                      <div class="flex items-center justify-center gap-2">
                        <label class="inline-block px-4 py-1.5 rounded-full bg-stone-200 dark:bg-stone-800 text-xs font-bold text-theme-primary hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer transition">
                          Ganti Foto Dokumen
                          <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
                        </label>
                        <button
                          type="button"
                          @click="kycPhotoPreview = null"
                          class="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div v-else class="space-y-3">
                      <div class="w-12 h-12 rounded-2xl bg-forest/10 text-forest dark:text-forest-glow flex items-center justify-center mx-auto">
                        <IconShieldCheck :size="24" />
                      </div>
                      <div>
                        <p class="font-bold text-theme-primary text-xs">Klik tombol di bawah untuk memilih foto identitas</p>
                        <p class="text-[11px] text-stone-500 mt-0.5">Pastikan 4 sudut e-KTP/SIM terlihat jelas, tidak buram, dan pencahayaan terang</p>
                      </div>
                      <label class="inline-block px-6 py-2.5 rounded-full bg-[#244E33] hover:bg-[#1B3B26] text-white text-xs font-bold cursor-pointer shadow-sm transition">
                        Pilih Berkas Foto Dokumen
                        <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
                      </label>
                      <p class="text-[10px] text-stone-400">Format yang didukung: JPG, PNG, WEBP (Maksimal 5 MB)</p>
                    </div>

                  </div>
                </div>

                <!-- Submit Action Button -->
                <div class="pt-3 border-t border-theme-border flex items-center gap-3">
                  <BaseButton
                    type="submit"
                    :loading="isSubmittingKyc"
                    variant="primary"
                    size="md"
                    class="w-full sm:w-auto font-black cursor-pointer shadow-md"
                  >
                    <IconShieldCheck :size="16" />
                    <span>Kirim Dokumen & Verifikasi KYC</span>
                  </BaseButton>

                  <button
                    v-if="currentUser.isKycVerified || currentUser.kycStatus === 'PENDING_REVIEW'"
                    type="button"
                    @click="isEditingKyc = false"
                    class="px-5 py-2.5 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>

              <!-- Right Column: Guidelines & Security Card (5 cols) -->
              <div class="lg:col-span-5 space-y-4">
                <div class="p-5 sm:p-6 rounded-3xl bg-stone-50 dark:bg-stone-900/80 border border-theme-border space-y-4">
                  <div class="flex items-center gap-2 text-forest dark:text-forest-glow">
                    <IconShieldCheck :size="18" />
                    <h4 class="font-black text-xs uppercase tracking-wider">Panduan Foto Dokumen Valid</h4>
                  </div>

                  <ul class="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                    <li class="flex items-start gap-2.5">
                      <IconCheck :size="14" class="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                      <span class="leading-relaxed">Pastikan seluruh <strong>4 sudut fisik kartu</strong> terlihat utuh dalam frame foto.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <IconCheck :size="14" class="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                      <span class="leading-relaxed">Semua teks seperti <strong>NIK, Nama, dan Alamat</strong> dapat dibaca jelas tanpa blur.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <IconCheck :size="14" class="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                      <span class="leading-relaxed">Gunakan pencahayaan cukup dan hindari pantulan cahaya flash yang menutupi data.</span>
                    </li>
                  </ul>
                </div>

                <div class="p-5 sm:p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                  <p class="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <IconShieldCheck :size="15" />
                    <span>Jaminan Keamanan & Privasi Data</span>
                  </p>
                  <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Dokumen Anda disimpan dengan enkripsi berstandar perbankan dan hanya digunakan untuk validasi keamanan aset sewa peralatan oleh tim verifikasi resmi e-punyasewa.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- TAB 3: Saved Address Book -->
        <div v-if="activeTab === 'addresses'" class="space-y-6 animate-fade-up">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="font-display text-xl sm:text-2xl font-black text-theme-primary">Buku Alamat Pengiriman</h2>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium mt-0.5">Kelola alamat favorit untuk pengiriman unit sewa yang cepat.</p>
            </div>

            <button
              @click="isAddAddressModalOpen = true"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-sm transition cursor-pointer shrink-0"
            >
              <span class="text-sm font-bold leading-none">+</span>
              <span>Tambah Alamat</span>
            </button>
          </div>

          <!-- Empty Addresses State -->
          <div
            v-if="currentUser.savedAddresses.length === 0"
            class="text-center py-16 bg-theme-card rounded-3xl border border-theme-border p-8 space-y-3 shadow-card"
          >
            <div class="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center mx-auto text-stone-400 dark:text-stone-300 border border-theme-border">
              <IconLocation :size="24" />
            </div>
            <h3 class="font-bold text-sm sm:text-base text-theme-primary">Belum Ada Alamat Tersimpan</h3>
            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed font-medium">
              Simpan alamat rumah, studio, atau kantor Anda agar proses checkout sewa unit lebih cepat.
            </p>
            <button
              @click="isAddAddressModalOpen = true"
              class="mt-3 px-6 py-2.5 bg-forest hover:bg-forest/90 text-white rounded-full text-xs font-bold cursor-pointer transition shadow-md inline-flex items-center gap-1.5"
            >
              <span class="text-sm font-bold leading-none">+</span>
              <span>Tambah Alamat Pertama</span>
            </button>
          </div>

          <!-- Address Cards Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="addr in currentUser.savedAddresses"
              :key="addr.id"
              class="bg-theme-card rounded-3xl border border-theme-border p-5 shadow-card space-y-3 relative hover:border-forest/40 transition"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-xs text-theme-primary bg-stone-100 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg border border-theme-border">
                  {{ addr.label }}
                </span>
                <span
                  v-if="addr.isDefault"
                  class="text-[10px] font-black bg-forest/15 text-forest dark:text-forest-glow px-2.5 py-0.5 rounded-full border border-forest/30 flex items-center gap-1"
                >
                  <IconCheck :size="10" class="stroke-[3]" />
                  <span>Alamat Utama</span>
                </span>
              </div>

              <div>
                <h4 class="font-bold text-sm text-theme-primary">{{ addr.recipientName }}</h4>
                <p class="text-xs text-stone-600 dark:text-stone-300 mt-0.5 font-medium">{{ addr.phone }}</p>
                <p class="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed font-normal">
                  {{ addr.fullAddress }}, {{ addr.city }}
                </p>
              </div>

              <div class="pt-3 border-t border-theme-border flex items-center justify-between text-xs">
                <button
                  v-if="!addr.isDefault"
                  @click="setDefaultAddress(addr.id)"
                  class="font-bold text-forest dark:text-forest-glow hover:underline cursor-pointer"
                >
                  Jadikan Utama
                </button>
                <span v-else class="text-[11px] text-stone-500 dark:text-stone-300 font-semibold flex items-center gap-1">
                  <IconCheck :size="11" class="text-emerald-500 stroke-[3]" />
                  <span>Default Checkout</span>
                </span>

                <button
                  @click="deleteSavedAddress(addr.id)"
                  class="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Modal 1: Edit Profile (Full Realistic Rental Customer Profile) -->
    <div v-if="isEditProfileModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="isEditProfileModalOpen = false" class="fixed inset-0 bg-black/70 backdrop-blur-xs"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-theme-border pb-4">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-forest dark:text-forest-glow flex items-center gap-1.5">
              <span>Pengaturan Akun Penyewa</span>
              <span class="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-glow"></span>
              <span>Data Rental Resmi</span>
            </span>
            <h3 class="font-display font-black text-lg sm:text-xl text-theme-primary mt-0.5">
              Ubah Data Akun & Profil Kreatif
            </h3>
          </div>
          <button
            @click="isEditProfileModalOpen = false"
            class="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center cursor-pointer transition text-stone-500 hover:text-theme-primary"
          >
            <IconClose :size="15" />
          </button>
        </div>

        <form @submit.prevent="handleSaveProfile" class="space-y-6 text-xs">
          
          <!-- SECTION 1: Identitas Pribadi & Kontak Utama -->
          <div class="bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-theme-border space-y-3.5">
            <h4 class="font-black text-xs uppercase tracking-wider text-forest dark:text-forest-glow flex items-center gap-1.5 border-b border-theme-border pb-2">
              <span>1. Identitas Pribadi & Kontak Utama</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="space-y-1">
                <label class="font-bold block text-theme-primary">Nama Lengkap Sesuai KTP <span class="text-rose-500">*</span></label>
                <input
                  v-model="editFullName"
                  type="text"
                  placeholder="Nama lengkap resmi"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold block text-theme-primary">Nama Panggilan / Alias</label>
                <input
                  v-model="editDisplayName"
                  type="text"
                  placeholder="Contoh: Fuad"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="font-bold block text-theme-primary">Alamat Email Terdaftar</label>
                  <span class="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <IconCheck :size="10" class="stroke-[3]" />
                    <span>Terhubung</span>
                  </span>
                </div>
                <input
                  v-model="editEmail"
                  type="email"
                  disabled
                  class="w-full bg-stone-100 dark:bg-stone-800/60 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-500 cursor-not-allowed"
                />
                <p class="text-[11px] text-stone-500 dark:text-stone-400 pt-1 leading-relaxed">
                  Digunakan untuk pengiriman faktur & invoice sewa resmi.
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Nomor WhatsApp Utama <span class="text-rose-500">*</span></label>
                <input
                  v-model="editPhone"
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
                <p class="text-[11px] text-stone-500 dark:text-stone-400 pt-1 leading-relaxed">
                  Untuk koordinasi pengiriman dan serah terima unit sewa.
                </p>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Alamat Domisili / Operasional (Master Wilayah) -->
          <div class="bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-theme-border space-y-3.5">
            <h4 class="font-black text-xs uppercase tracking-wider text-forest dark:text-forest-glow flex items-center gap-1.5 border-b border-theme-border pb-2">
              <span>2. Alamat Domisili & Wilayah Operasional</span>
            </h4>

            <!-- Independent Cascading Master Wilayah (Provinsi -> Kota/Kab -> Kecamatan -> Kelurahan) -->
            <CascadingRegionSelect
              :province-id="editProvinceId"
              :province-name="editProvinceName"
              :regency-id="editRegencyId"
              :regency-name="editRegencyName"
              :district-id="editDistrictId"
              :district-name="editDistrictName"
              :village-id="editVillageId"
              :village-name="editVillageName"
              @update:province-id="editProvinceId = $event"
              @update:province-name="editProvinceName = $event"
              @update:regency-id="editRegencyId = $event"
              @update:regency-name="editRegencyName = $event"
              @update:district-id="editDistrictId = $event"
              @update:district-name="editDistrictName = $event"
              @update:village-id="editVillageId = $event"
              @update:village-name="editVillageName = $event"
              @change="(payload) => {
                editProvinceId = payload.provinceId
                editProvinceName = payload.provinceName
                editRegencyId = payload.regencyId
                editRegencyName = payload.regencyName
                editDistrictId = payload.districtId
                editDistrictName = payload.districtName
                editVillageId = payload.villageId
                editVillageName = payload.villageName
                if (payload.regencyName) {
                  editCity = payload.fullRegionText || `${payload.regencyName}, ${payload.provinceName}`
                }
              }"
              layout="grid-2"
            />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div class="sm:col-span-2 space-y-1.5">
                <label class="font-bold block text-theme-primary">Alamat Lengkap (Nama Jalan, No. Bangunan, RT/RW)</label>
                <textarea
                  v-model="editAddress"
                  rows="2"
                  placeholder="Contoh: Jl. Senopati Raya No. 45, Kebayoran Baru"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl p-3 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                ></textarea>
                <p class="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5 leading-relaxed">
                  Tuliskan nomor rumah/gedung, RT/RW, dan patokan lokasi.
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Kode Pos</label>
                <input
                  v-model="editPostalCode"
                  type="text"
                  placeholder="Contoh: 12190"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 3: Kontak Darurat Kerabat / Studio -->
          <div class="bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-theme-border space-y-3.5">
            <div>
              <h4 class="font-black text-xs uppercase tracking-wider text-forest dark:text-forest-glow flex items-center gap-1.5 border-b border-theme-border pb-2">
                <span>3. Kontak Darurat Kerabat / Studio</span>
              </h4>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 pt-1.5 leading-relaxed">
                Diperlukan untuk koordinasi darurat keamanan unit sewa bernilai tinggi jika nomor utama tidak dapat dihubungi.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Nama Kontak Darurat</label>
                <input
                  v-model="editEmergencyContactName"
                  type="text"
                  placeholder="Nama kerabat / rekan"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">No. Telepon Darurat</label>
                <input
                  v-model="editEmergencyPhone"
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Hubungan Kerabat</label>
                <select
                  v-model="editEmergencyRelation"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                >
                  <option value="Pasangan">Pasangan (Suami/Istri)</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Rekan Kerja / Studio">Rekan Kerja / Studio</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 4: Profil Profesi & Portofolio Kreatif -->
          <div class="bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-theme-border space-y-3.5">
            <h4 class="font-black text-xs uppercase tracking-wider text-forest dark:text-forest-glow flex items-center gap-1.5 border-b border-theme-border pb-2">
              <span>4. Profil Profesi & Media Sosial Kreatif</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Profesi / Spesialisasi</label>
                <input
                  v-model="editProfession"
                  type="text"
                  placeholder="Contoh: Commercial Filmmaker"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Nama Studio / PH</label>
                <input
                  v-model="editCompanyOrStudio"
                  type="text"
                  placeholder="Contoh: Auri Visual Studio"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold block text-theme-primary">Akun Instagram / Portofolio</label>
                <input
                  v-model="editSocialMediaInstagram"
                  type="text"
                  placeholder="Contoh: @aurifuad"
                  class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>

            <div class="space-y-1.5 pt-1">
              <label class="font-bold block text-theme-primary">Bio / Catatan Profil Singkat</label>
              <textarea
                v-model="editBio"
                rows="2"
                placeholder="Deskripsi singkat spesialisasi karya atau kebutuhan produksi Anda..."
                class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-xl p-3 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
              ></textarea>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5 leading-relaxed">
                Tuliskan ringkasan portofolio atau kebutuhan sewa perlengkapan rutin Anda.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-theme-border flex items-center justify-end gap-3 sticky bottom-0 bg-theme-card/95 backdrop-blur-md py-2 z-10">
            <button
              type="button"
              @click="isEditProfileModalOpen = false"
              class="px-5 py-2.5 rounded-full border border-theme-border font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 rounded-full bg-forest hover:bg-forest/90 text-white font-black cursor-pointer shadow-md text-xs transition"
            >
              Simpan Profil Lengkap
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Add New Address -->
    <div v-if="isAddAddressModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="isAddAddressModalOpen = false" class="fixed inset-0 bg-black/70 backdrop-blur-xs"></div>
      <div class="relative bg-theme-card rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div class="flex items-center justify-between border-b border-theme-border pb-3">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-forest dark:text-forest-glow">
              Buku Alamat Pengiriman
            </span>
            <h3 class="font-display font-black text-base text-theme-primary mt-0.5">
              Tambah Alamat Pengiriman Baru
            </h3>
          </div>
          <button
            @click="isAddAddressModalOpen = false"
            class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center cursor-pointer transition text-stone-500 hover:text-theme-primary"
          >
            <IconClose :size="14" />
          </button>
        </div>

        <form @submit.prevent="handleAddAddressSubmit" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold block text-theme-primary">Label Alamat <span class="text-rose-500">*</span></label>
            <input
              v-model="addrLabel"
              type="text"
              placeholder="Contoh: Rumah / Studio / Kantor"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold block text-theme-primary">Nama Penerima <span class="text-rose-500">*</span></label>
              <input
                v-model="addrRecipient"
                type="text"
                placeholder="Nama penerima paket sewa"
                class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold block text-theme-primary">No. WhatsApp Penerima <span class="text-rose-500">*</span></label>
              <input
                v-model="addrPhone"
                type="tel"
                placeholder="0812xxxxxxx"
                class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </div>
          </div>

          <!-- Cascading Wilayah Pengiriman (Master Wilayah) -->
          <div class="bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-2xl border border-theme-border space-y-2.5">
            <span class="text-[11px] font-bold text-forest dark:text-forest-glow block">
              Pilih Wilayah Pengiriman (Master Wilayah):
            </span>
            <CascadingRegionSelect
              :province-id="addrProvinceId"
              :province-name="addrProvinceName"
              :regency-id="addrRegencyId"
              :regency-name="addrRegencyName"
              :district-id="addrDistrictId"
              :district-name="addrDistrictName"
              :village-id="addrVillageId"
              :village-name="addrVillageName"
              @update:province-id="addrProvinceId = $event"
              @update:province-name="addrProvinceName = $event"
              @update:regency-id="addrRegencyId = $event"
              @update:regency-name="addrRegencyName = $event"
              @update:district-id="addrDistrictId = $event"
              @update:district-name="addrDistrictName = $event"
              @update:village-id="addrVillageId = $event"
              @update:village-name="addrVillageName = $event"
              @change="(payload) => {
                addrProvinceId = payload.provinceId
                addrProvinceName = payload.provinceName
                addrRegencyId = payload.regencyId
                addrRegencyName = payload.regencyName
                addrDistrictId = payload.districtId
                addrDistrictName = payload.districtName
                addrVillageId = payload.villageId
                addrVillageName = payload.villageName
                if (payload.regencyName) {
                  addrCity = payload.fullRegionText || `${payload.regencyName}, ${payload.provinceName}`
                }
              }"
              layout="grid-2"
              :required="true"
            />
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="font-bold block text-theme-primary">Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Patokan) <span class="text-rose-500">*</span></label>
            </div>
            <textarea
              v-model="addrFull"
              rows="2"
              placeholder="Contoh: Jl. Senopati Raya No. 45, Studio Fotografi Lt. 2"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl p-3 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
              required
            ></textarea>
          </div>

          <div class="space-y-1">
            <label class="font-bold block text-theme-primary">Kode Pos (Opsional)</label>
            <input
              v-model="addrPostalCode"
              type="text"
              placeholder="Contoh: 12190"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div class="flex items-center gap-2.5 pt-1 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl border border-theme-border">
            <input
              id="is-default-addr"
              v-model="addrIsDefault"
              type="checkbox"
              class="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
            />
            <label for="is-default-addr" class="text-xs font-bold cursor-pointer text-theme-primary">
              Jadikan sebagai alamat pengiriman utama (Default Checkout)
            </label>
          </div>

          <div class="pt-3 border-t border-theme-border flex justify-end gap-2.5">
            <button
              type="button"
              @click="isAddAddressModalOpen = false"
              class="px-4 py-2.5 rounded-full border border-theme-border font-bold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-full bg-forest hover:bg-forest/90 text-white font-black cursor-pointer shadow-sm text-xs"
            >
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
