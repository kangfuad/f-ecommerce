<script setup lang="ts">
import {
  IconShieldCheck,
  IconRefundDeposit,
  IconInsurance,
  IconDeliveryTruck,
} from '@/presentation/components/icons'

const valuePillars = [
  {
    title: 'Unit 100% Terawat & Bersih',
    desc: 'Setiap unit melalui QC ketat, disinfeksi, dan sensor/lensa dibersihkan sebelum dikirim.',
    icon: IconShieldCheck,
  },
  {
    title: 'Deposit Kembali Cepat',
    desc: 'Deposit jaminan dikembalikan 100% otomatis maksimal 1x24 jam setelah barang dicek.',
    icon: IconRefundDeposit,
  },
  {
    title: 'Perlindungan Asuransi',
    desc: 'Tenang berkarya dengan asuransi proteksi kerusakan wajar dan goresan ringan.',
    icon: IconInsurance,
  },
  {
    title: 'Pickup & Delivery Fleksibel',
    desc: 'Pilihan kirim kurir instan ke lokasi atau ambil langsung di 12+ Pickup Point resmi.',
    icon: IconDeliveryTruck,
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
            class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-sage dark:text-sage-soft border border-theme-border flex items-center justify-center shrink-0 group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all duration-300 shadow-sm"
          >
            <component :is="item.icon" :size="22" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-theme-primary">{{ item.title }}</h4>
            <p class="text-xs text-theme-muted mt-1 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
