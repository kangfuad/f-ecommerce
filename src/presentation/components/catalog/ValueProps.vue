<script setup lang="ts">
import {
  IconShieldCheck,
  IconCalendarDate,
  IconCheck,
  IconStar,
} from '@/presentation/components/icons'

const valuePillars = [
  {
    title: 'Katalog Lengkap & Terverifikasi',
    desc: 'Pilihan unit perlengkapan modern dari berbagai kategori yang terverifikasi dan siap pakai.',
    icon: IconShieldCheck,
  },
  {
    title: 'Direct Booking & Fleksibel',
    desc: 'Tentukan tanggal sewa, durasi, serta tempat serah terima langsung dengan penyedia.',
    icon: IconCalendarDate,
  },
  {
    title: 'Form Perjanjian Sewa Resmi',
    desc: 'Dilengkapi surat perjanjian sewa dan formulir serah terima resmi untuk kenyamanan bersama.',
    icon: IconCheck,
  },
  {
    title: 'Reputasi & Ulasan 2 Arah',
    desc: 'Sistem rating transparan antara penyewa dan penyedia untuk menjaga standar kualitas layanan.',
    icon: IconStar,
  },
]
</script>

<template>
  <section class="border-b border-theme-border bg-theme-card py-8 sm:py-10 transition-colors duration-300">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div
          v-for="item in valuePillars"
          :key="item.title"
          class="flex items-start gap-4 group"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-forest dark:text-forest-glow border border-theme-border flex items-center justify-center shrink-0 group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all duration-300 shadow-xs"
          >
            <component :is="item.icon" :size="22" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-theme-primary">{{ item.title }}</h4>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
