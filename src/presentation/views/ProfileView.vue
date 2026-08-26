<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/presentation/composables/useAuth'
import { useToast } from '@/presentation/composables/useToast'
import { formatDateToIndonesian } from '@/core/utils/date'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import CascadingRegionSelect from '@/presentation/components/common/CascadingRegionSelect.vue'
import {
  IconShieldCheck,
  IconCheck,
  IconLocation,
  IconClose,
  IconStar,
  IconEdit,
  IconDeliveryTruck,
  IconCalendarDate,
} from '@/presentation/components/icons'

const router = useRouter()
const {
  currentUser,
  isLoggedIn,
  openLoginModal,
  updateProfile,
} = useAuth()
const { showToast } = useToast()

// Active Tab
const activeTab = ref<'profile' | 'reviews'>('profile')

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

watch(
  isLoggedIn,
  (val) => {
    if (!val) {
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
  }
})

function openEditProfile() {
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
  }
  isEditProfileModalOpen.value = true
}

function handleRegionChanged(payload: {
  provinceId: string
  provinceName: string
  regencyId: string
  regencyName: string
  districtId: string
  districtName: string
  villageId: string
  villageName: string
  fullRegionText: string
}) {
  editProvinceId.value = payload.provinceId
  editProvinceName.value = payload.provinceName
  editRegencyId.value = payload.regencyId
  editRegencyName.value = payload.regencyName
  editDistrictId.value = payload.districtId
  editDistrictName.value = payload.districtName
  editVillageId.value = payload.villageId
  editVillageName.value = payload.villageName
  editCity.value = payload.fullRegionText
}

function handleSaveProfile() {
  if (!editFullName.value.trim()) {
    showToast({ type: 'warning', title: 'Nama Lengkap Wajib', message: 'Silakan isi nama lengkap Anda.' })
    return
  }
  if (!editPhone.value.trim() || editPhone.value.trim().length < 8) {
    showToast({ type: 'warning', title: 'Nomor WhatsApp Wajib', message: 'Masukkan nomor WhatsApp yang valid.' })
    return
  }

  updateProfile({
    fullName: editFullName.value.trim(),
    displayName: editDisplayName.value.trim() || editFullName.value.trim(),
    email: editEmail.value.trim(),
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
    message: 'Data identitas, domisili, kontak darurat, dan profesi Anda berhasil disimpan.',
  })
}
</script>

<template>
  <div class="min-h-screen bg-theme-bg text-theme-primary flex flex-col">
    <AppHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div v-if="currentUser" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-up">
        
        <!-- Profile Header Hero Card -->
        <div class="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-5">
            <!-- Avatar -->
            <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#244E33] text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md shrink-0">
              {{ currentUser.initials }}
              <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs border-2 border-theme-card">
                ✓
              </span>
            </div>

            <!-- Identity Info -->
            <div class="space-y-1.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-theme-primary truncate">
                  {{ currentUser.fullName }}
                </h1>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  Penyewa Terverifikasi
                </span>
                <span v-if="currentUser.hasProviderStore" class="px-2.5 py-0.5 rounded-full bg-forest/15 text-forest dark:text-forest-glow text-[10px] font-black border border-forest/30">
                  Mitra Penyedia Sewa
                </span>
              </div>

              <!-- Profession & Studio -->
              <p v-if="currentUser.profession" class="text-xs font-bold text-forest dark:text-forest-glow flex items-center gap-1.5 flex-wrap">
                <span>{{ currentUser.profession }}</span>
                <span v-if="currentUser.companyOrStudio" class="text-stone-400 font-normal"> • {{ currentUser.companyOrStudio }}</span>
                <span v-if="currentUser.socialMediaInstagram" class="text-stone-500 font-semibold"> ({{ currentUser.socialMediaInstagram }})</span>
              </p>

              <!-- Contacts -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                <span class="text-theme-primary font-medium">{{ currentUser.email }}</span>
                <span>•</span>
                <span class="text-theme-primary font-mono">{{ currentUser.phone }}</span>
                <span v-if="currentUser.city">•</span>
                <span v-if="currentUser.city" class="text-stone-500 truncate max-w-xs">{{ currentUser.city }}</span>
              </div>

              <!-- Bio -->
              <p v-if="currentUser.bio" class="text-xs text-stone-600 dark:text-stone-300 italic pt-1 line-clamp-2">
                "{{ currentUser.bio }}"
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              @click="openEditProfile"
              class="h-10 px-5 rounded-full border border-theme-border hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <IconEdit :size="13" />
              <span>Ubah Profil</span>
            </button>

            <router-link
              to="/pesanan-saya"
              class="h-10 px-5 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black shadow-sm transition flex items-center gap-1.5"
            >
              <IconDeliveryTruck :size="14" />
              <span>Pesanan Saya</span>
            </router-link>
          </div>
        </div>

        <!-- Navigation Tabs (Clean 2 Tabs) -->
        <div class="flex items-center gap-2 border-b border-theme-border pb-3">
          <button
            type="button"
            @click="activeTab = 'profile'"
            :class="[
              'px-5 py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer shrink-0',
              activeTab === 'profile'
                ? 'bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                : 'bg-theme-card border border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            Informasi Akun & Data Pribadi
          </button>

          <button
            type="button"
            @click="activeTab = 'reviews'"
            :class="[
              'px-5 py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5',
              activeTab === 'reviews'
                ? 'bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                : 'bg-theme-card border border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            <IconStar :size="13" class="text-amber-500" />
            <span>Reputasi & Ulasan Penyewa (5.0 ⭐)</span>
          </button>
        </div>

        <!-- TAB 1: Account Information & Profile Details -->
        <div v-if="activeTab === 'profile'" class="space-y-6 animate-fade-up">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card 1: Data Identitas & Kontak -->
            <div class="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-theme-border">
                <h3 class="font-extrabold text-sm text-theme-primary">Identitas Pemesan Resmi</h3>
                <span class="text-[10px] font-bold text-forest dark:text-forest-glow">Data Terdaftar</span>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Nama Lengkap Sesuai KTP</span>
                  <p class="font-bold text-theme-primary text-sm mt-0.5">{{ currentUser.fullName }}</p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <span class="text-[10px] text-stone-400 font-bold uppercase block">No. WhatsApp</span>
                    <p class="font-mono font-bold text-theme-primary mt-0.5">{{ currentUser.phone }}</p>
                  </div>
                  <div>
                    <span class="text-[10px] text-stone-400 font-bold uppercase block">Email Aktif</span>
                    <p class="font-bold text-theme-primary mt-0.5 truncate">{{ currentUser.email }}</p>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Profesi / Studio</span>
                  <p class="font-bold text-theme-primary mt-0.5">
                    {{ currentUser.profession || '-' }}
                    <span v-if="currentUser.companyOrStudio" class="text-stone-500 font-normal"> ({{ currentUser.companyOrStudio }})</span>
                  </p>
                </div>

                <div>
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Instagram / Portfolio</span>
                  <p class="font-bold text-theme-primary mt-0.5">{{ currentUser.socialMediaInstagram || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- Card 2: Domisili & Kontak Darurat -->
            <div class="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-theme-border">
                <h3 class="font-extrabold text-sm text-theme-primary">Domisili & Kontak Darurat</h3>
                <span class="text-[10px] font-bold text-stone-400">Keperluan Verifikasi Temu</span>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Alamat Domisili Utama</span>
                  <p class="font-bold text-theme-primary mt-0.5">{{ currentUser.address || 'Belum diatur' }}</p>
                  <p v-if="currentUser.city" class="text-[11px] text-stone-500 mt-0.5">{{ currentUser.city }} ({{ currentUser.postalCode || '-' }})</p>
                </div>

                <div class="pt-2 border-t border-theme-border space-y-2">
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Kontak Darurat (Kerabat / Pasangan)</span>
                  <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs space-y-1">
                    <p class="font-bold text-theme-primary">
                      {{ currentUser.emergencyContactName || 'Rina Fuad' }}
                      <span class="text-[10px] font-normal text-stone-500">({{ currentUser.emergencyRelation || 'Pasangan' }})</span>
                    </p>
                    <p class="font-mono text-stone-500 text-[11px]">{{ currentUser.emergencyPhone || '081298765432' }}</p>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] text-stone-400 font-bold uppercase block">Tanggal Pendaftaran Akun</span>
                  <p class="text-stone-500 font-bold mt-0.5">{{ formatDateToIndonesian(currentUser.joinedAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Banner to Direct Booking -->
          <div class="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <h4 class="font-bold text-sm text-emerald-950 dark:text-emerald-200">Ingin Mengajukan Sewa Perlengkapan?</h4>
              <p class="text-xs text-stone-600 dark:text-stone-300">
                Pilih unit di katalog, tentukan jadwal temu dan tempat serah terima secara langsung.
              </p>
            </div>
            <router-link
              to="/katalog"
              class="px-5 py-2.5 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 text-white dark:text-stone-950 text-xs font-black shrink-0 text-center"
            >
              Eksplorasi Katalog
            </router-link>
          </div>

        </div>

        <!-- TAB 2: Reputasi & Ulasan Penyewa -->
        <div v-if="activeTab === 'reviews'" class="space-y-6 animate-fade-up">
          
          <!-- Reputation Score Banner -->
          <div class="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-wider text-forest dark:text-forest-glow">
                Skor Kredibilitas & Reputasi Penyewa
              </span>
              <div class="flex items-center gap-3">
                <span class="text-3xl sm:text-4xl font-black font-mono text-theme-primary">5.0</span>
                <div>
                  <div class="flex text-amber-500 text-sm">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                  <p class="text-[11px] text-stone-500 font-bold">100% Ulasan Positif dari Mitra Penyedia Sewa</p>
                </div>
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1.5 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1.5">
                <IconCheck :size="12" class="stroke-[3]" />
                <span>Pengembalian Tepat Waktu (100%)</span>
              </span>
              <span class="px-3 py-1.5 rounded-2xl bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-500/30 flex items-center gap-1.5">
                <IconShieldCheck :size="12" />
                <span>Unit Terjaga Sangat Baik</span>
              </span>
            </div>
          </div>

          <!-- Reviews List from Providers -->
          <div class="space-y-4">
            <h3 class="font-extrabold text-sm text-theme-primary">Ulasan dari Mitra Penyedia Sewa</h3>

            <div class="space-y-3">
              <div class="p-5 rounded-3xl bg-theme-card border border-theme-border space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-forest/10 text-forest dark:text-forest-glow flex items-center justify-center font-bold text-xs">
                      CTR
                    </div>
                    <div>
                      <strong class="text-xs font-bold text-theme-primary block">CinemaTech Rental Jakarta</strong>
                      <span class="text-[10px] text-stone-400">Transaksi Sewa: Sony FX3 Cinema Line • 20 Feb 2026</span>
                    </div>
                  </div>
                  <span class="text-amber-500 font-black text-xs">5.0 ⭐</span>
                </div>
                <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                  "Penyewa sangat profesional, tepat waktu saat jadwal temu serah terima, dan unit kembali dalam kondisi sangat bersih dan rapi. Sangat direkomendasikan untuk mitra sewa lainnya."
                </p>
                <div class="flex flex-wrap gap-2 pt-1 border-t border-theme-border/60">
                  <span class="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                    Pengembalian Bersih & Utuh
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                    Komunikasi Sangat Baik
                  </span>
                </div>
              </div>

              <div class="p-5 rounded-3xl bg-theme-card border border-theme-border space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-forest/10 text-forest dark:text-forest-glow flex items-center justify-center font-bold text-xs">
                      SKD
                    </div>
                    <div>
                      <strong class="text-xs font-bold text-theme-primary block">SkyDrone Pilot BSD</strong>
                      <span class="text-[10px] text-stone-400">Transaksi Sewa: DJI Mavic 3 Pro Cine • 10 Jan 2026</span>
                    </div>
                  </div>
                  <span class="text-amber-500 font-black text-xs">5.0 ⭐</span>
                </div>
                <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                  "Serah terima berjalan lancar, pembayaran di tempat diselesaikan dengan cepat dan tanpa kendala. Baterai dan hardcase drone dirawat dengan sangat baik."
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>

    <!-- Modal Edit Profile -->
    <div v-if="isEditProfileModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div @click="isEditProfileModalOpen = false" class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div class="relative bg-theme-card text-theme-primary rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-theme-border z-10 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between pb-3 border-b border-theme-border">
          <div>
            <h3 class="font-extrabold text-base text-theme-primary">Ubah Data Profil Pemesan</h3>
            <p class="text-xs text-stone-500">Perbarui kontak, domisili, dan profesi untuk kemudahan serah terima unit.</p>
          </div>
          <button @click="isEditProfileModalOpen = false" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-theme-primary transition cursor-pointer">
            <IconClose :size="14" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Identitas Utama -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Nama Lengkap *</label>
              <input v-model="editFullName" type="text" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none" />
            </div>
            <div>
              <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">No. WhatsApp Aktif *</label>
              <input v-model="editPhone" type="tel" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none font-mono" />
            </div>
            <div>
              <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Profesi / Keahlian</label>
              <input v-model="editProfession" type="text" placeholder="Contoh: Videografer, Musisi, Event Organizer" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none" />
            </div>
            <div>
              <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Nama Studio / Perusahaan</label>
              <input v-model="editCompanyOrStudio" type="text" placeholder="Contoh: Auri Studio" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none" />
            </div>
          </div>

          <!-- Region / Domisili -->
          <div class="pt-2 border-t border-theme-border space-y-3">
            <span class="font-bold block text-theme-primary">Wilayah Domisili:</span>
            <CascadingRegionSelect
              v-model:province-id="editProvinceId"
              v-model:province-name="editProvinceName"
              v-model:regency-id="editRegencyId"
              v-model:regency-name="editRegencyName"
              v-model:district-id="editDistrictId"
              v-model:district-name="editDistrictName"
              v-model:village-id="editVillageId"
              v-model:village-name="editVillageName"
              :initial-province-id="editProvinceId"
              :initial-regency-id="editRegencyId"
              :initial-district-id="editDistrictId"
              :initial-village-id="editVillageId"
              @change="handleRegionChanged"
            />
            <div>
              <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Alamat Lengkap / Jalan & Nomor</label>
              <textarea v-model="editAddress" rows="2" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none"></textarea>
            </div>
          </div>

          <!-- Kontak Darurat -->
          <div class="pt-2 border-t border-theme-border space-y-3">
            <span class="font-bold block text-theme-primary">Kontak Darurat:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Nama Kerabat</label>
                <input v-model="editEmergencyContactName" type="text" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none" />
              </div>
              <div>
                <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Nomor HP Kerabat</label>
                <input v-model="editEmergencyPhone" type="tel" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none font-mono" />
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div>
            <label class="block font-bold text-stone-600 dark:text-stone-300 mb-1">Bio Singkat</label>
            <textarea v-model="editBio" rows="2" placeholder="Tuliskan sekilas tentang kebutuhan sewa atau proyek Anda..." class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border focus:ring-2 focus:ring-forest outline-none"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-theme-border">
          <button @click="isEditProfileModalOpen = false" class="px-4 py-2 rounded-xl text-xs font-bold text-stone-500">Batal</button>
          <button @click="handleSaveProfile" class="px-6 py-2 rounded-xl bg-[#244E33] hover:bg-[#1B3B26] text-white text-xs font-bold shadow-xs">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
