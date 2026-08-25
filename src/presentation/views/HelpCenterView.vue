<script setup lang="ts">
import { ref, computed } from 'vue'
import { APP_CONFIG } from '@/core/config/app.config'
import AppHeader from '@/presentation/components/common/AppHeader.vue'
import AppFooter from '@/presentation/components/common/AppFooter.vue'
import {
  IconShieldCheck,
  IconCheck,
  IconLocation,
  IconDeliveryTruck,
  IconBoxPackage,
  IconCalendarDate,
  IconChevronDown,
  IconStar,
} from '@/presentation/components/icons'

// Search state
const searchQuery = ref('')
const selectedCategory = ref<string>('ALL')

// FAQ Data
interface FaqItem {
  id: string
  category: 'PROSEDUR' | 'DEPOSIT' | 'ASURANSI' | 'PENGANTARAN'
  categoryLabel: string
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'PROSEDUR',
    categoryLabel: 'Alur & Prosedur Rental',
    question: 'Bagaimana alur dan prosedur menyewa unit di e-punyasewa?',
    answer: 'Alur sewa sangat mudah: 1) Pilih unit kamera/drone/gadget di katalog, 2) Tentukan tanggal mulai dan selesai sewa, 3) Pilih metode serah terima (Diantar Kurir ke Alamat atau Ambil Sendiri di Hub), 4) Selesaikan pembayaran online (QRIS/Transfer VA), 5) Unit melewati inspeksi QC & sterilisasi sebelum diserahkan kepada Anda.',
  },
  {
    id: 'faq-2',
    category: 'PROSEDUR',
    categoryLabel: 'Alur & Prosedur Rental',
    question: 'Apakah saya bisa memperpanjang durasi sewa saat unit sedang digunakan?',
    answer: 'Tentu bisa! Selama unit belum dipesan oleh penyewa lain pada hari berikutnya, Anda dapat mengajukan perpanjangan masa sewa langsung dari dashboard "Riwayat Pesanan" atau menghubungi CS WhatsApp kami.',
  },
  {
    id: 'faq-3',
    category: 'DEPOSIT',
    categoryLabel: 'Kebijakan Deposit & Refund',
    question: 'Berapa besaran deposit jaminan dan kapan dikembalikan?',
    answer: 'Deposit jaminan dihitung proporsional berdasarkan nilai perangkat. Deposit bersifat 100% REFUNDABLE (dapat dikembalikan penuh) dan akan otomatis ditransfer kembali ke rekening Anda maksimal 1x24 jam setelah unit selesai diperiksa oleh tim QC saat pengembalian.',
  },
  {
    id: 'faq-4',
    category: 'DEPOSIT',
    categoryLabel: 'Kebijakan Deposit & Refund',
    question: 'Bagaimana cara mendapatkan fasilitas Bebas Deposit (Rp 0)?',
    answer: 'Anda cukup melakukan verifikasi identitas (e-KTP / SIM) di menu Profil Akun Anda. Setelah status akun berubah menjadi "Verified Gold", seluruh pesanan sewa Anda di e-punyasewa otomatis BEBAS DEPOSIT (Rp 0).',
  },
  {
    id: 'faq-5',
    category: 'ASURANSI',
    categoryLabel: 'Asuransi & Proteksi Unit',
    question: 'Apa saja yang dilindungi oleh opsi Asuransi Proteksi Unit?',
    answer: 'Asuransi opsional melindungi penyewa dari risiko biaya perbaikan akibat goresan halus kosmetik, kendala debu/kelembapan wajar, dan kerusakan fungsi non-kesengajaan selama masa sewa.',
  },
  {
    id: 'faq-6',
    category: 'PENGANTARAN',
    categoryLabel: 'Pengantaran Kurir & Hub',
    question: 'Wilayah mana saja yang dijangkau oleh layanan pengiriman kurir?',
    answer: 'Layanan kurir instan dan sameday kami saat ini mencakup area Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi), Bandung, Surabaya, dan Bali. Unit diantar dalam wadah hardcase anti-guncangan bersertifikasi.',
  },
  {
    id: 'faq-7',
    category: 'PENGANTARAN',
    categoryLabel: 'Pengantaran Kurir & Hub',
    question: 'Berapa jam sebelum jadwal sewa saya bisa mengambil unit di Hub?',
    answer: 'Untuk pengambilan di Hub Titik Temu, unit siap diambil mulai H-1 pukul 19.00 WIB (tanpa biaya tambahan) atau sesuai jam mulai sewa pada hari-H.',
  },
]

// Open accordion tracking
const openFaqIds = ref<string[]>(['faq-1', 'faq-3', 'faq-4'])

function toggleFaq(id: string) {
  if (openFaqIds.value.includes(id)) {
    openFaqIds.value = openFaqIds.value.filter((i) => i !== id)
  } else {
    openFaqIds.value.push(id)
  }
}

const filteredFaqs = computed(() => {
  return faqs.filter((faq) => {
    const matchesCategory = selectedCategory.value === 'ALL' || faq.category === selectedCategory.value
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-theme-page text-theme-primary transition-colors duration-300">
    <AppHeader />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      
      <!-- Hero Header -->
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-[11px] font-extrabold uppercase tracking-widest text-forest dark:text-forest-glow">
          Pusat Bantuan & Panduan
        </span>
        <h1 class="font-display text-3xl sm:text-4xl font-black text-theme-primary tracking-tight">
          Ada yang Bisa Kami Bantu?
        </h1>
        <p class="text-xs sm:text-sm text-stone-500 leading-relaxed">
          Temukan jawaban seputar tata cara sewa, garansi pengembalian deposit 100%, klaim proteksi asuransi, hingga lokasi hub penyerahan unit.
        </p>

        <!-- Search Bar -->
        <div class="pt-2 max-w-lg mx-auto">
          <div class="relative flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari pertanyaan (contoh: deposit, perpanjangan, asuransi)..."
              class="w-full bg-theme-card border border-theme-border rounded-full pl-5 pr-12 py-3 text-xs font-medium text-theme-primary shadow-md focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <span class="absolute right-4 text-stone-400 text-xs font-bold">🔍</span>
          </div>
        </div>
      </div>

      <!-- Quick Category Filters -->
      <div class="flex items-center justify-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          @click="selectedCategory = 'ALL'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'ALL'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Semua Topik
        </button>

        <button
          @click="selectedCategory = 'PROSEDUR'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'PROSEDUR'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Alur & Prosedur
        </button>

        <button
          @click="selectedCategory = 'DEPOSIT'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'DEPOSIT'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Deposit & Refund
        </button>

        <button
          @click="selectedCategory = 'ASURANSI'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'ASURANSI'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Asuransi Proteksi
        </button>

        <button
          @click="selectedCategory = 'PENGANTARAN'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shrink-0',
            selectedCategory === 'PENGANTARAN'
              ? 'bg-forest text-white border-forest shadow-xs'
              : 'bg-theme-card border-theme-border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          Kurir & Titik Hub
        </button>
      </div>

      <!-- FAQ Accordion List -->
      <div class="space-y-3 max-w-3xl mx-auto">
        <div
          v-if="filteredFaqs.length === 0"
          class="text-center py-12 bg-theme-card rounded-3xl border border-theme-border p-8"
        >
          <p class="font-bold text-theme-primary text-sm">Tidak ada pertanyaan yang cocok</p>
          <p class="text-xs text-stone-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>

        <div
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="bg-theme-card rounded-2xl border border-theme-border overflow-hidden transition shadow-xs"
        >
          <button
            @click="toggleFaq(faq.id)"
            class="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-theme-primary flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition"
          >
            <div class="space-y-0.5 min-w-0">
              <span class="text-[10px] font-extrabold uppercase text-forest dark:text-forest-glow tracking-wider block">
                {{ faq.categoryLabel }}
              </span>
              <span class="block text-theme-primary font-bold">{{ faq.question }}</span>
            </div>
            <IconChevronDown
              :size="16"
              :class="['text-stone-400 transition-transform duration-200 shrink-0', openFaqIds.includes(faq.id) && 'rotate-180 text-forest']"
            />
          </button>

          <div
            v-if="openFaqIds.includes(faq.id)"
            class="px-4 sm:px-5 pb-5 pt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-theme-border/60 bg-stone-50/30 dark:bg-stone-900/30 animate-fade-in"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>

      <!-- Contact Support Banner -->
      <div class="bg-gradient-to-br from-stone-900 to-[#14261B] text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-1 text-center sm:text-left">
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Butuh Bantuan Langsung?
          </span>
          <h3 class="font-display text-lg sm:text-xl font-extrabold text-white">
            Konsultasikan dengan Tim Support Kami
          </h3>
          <p class="text-xs text-stone-400">
            Layanan Customer Care siap menjawab pertanyaan seputar ketersediaan unit dan jadwal syuting Anda.
          </p>
        </div>

        <a
          :href="`https://wa.me/${APP_CONFIG.SUPPORT_PHONE.replace(/[^0-9]/g, '')}?text=Halo%20CS%20e-punyasewa,%20saya%20ingin%20bertanya%20seputar%20sewa%20unit`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 font-black text-xs rounded-full shadow-md transition shrink-0 cursor-pointer"
        >
          <span>Chat WhatsApp Resmi</span>
          <IconArrowRight :size="14" />
        </a>
      </div>

    </main>

    <AppFooter />
  </div>
</template>
