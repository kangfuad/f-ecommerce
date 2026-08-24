<script setup lang="ts">
const valuePillars = [
  {
    title: 'Unit 100% Terawat & Bersih',
    desc: 'Setiap unit melalui QC ketat, disinfeksi, dan sensor/lensa dibersihkan sebelum dikirim.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Deposit Kembali Cepat',
    desc: 'Deposit jaminan dikembalikan 100% otomatis maksimal 1x24 jam setelah barang dicek.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`,
  },
  {
    title: 'Perlindungan Asuransi',
    desc: 'Tenang berkarya dengan asuransi proteksi kerusakan wajar dan goresan ringan.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    title: 'Pickup & Delivery Fleksibel',
    desc: 'Pilihan kirim kurir instan ke lokasi atau ambil langsung di 12+ Pickup Point resmi.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  },
]
</script>

<template>
  <section class="border-b border-theme-border bg-theme-card py-8 sm:py-10 transition-colors duration-300">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="item in valuePillars"
          :key="item.title"
          class="flex items-start gap-4 group"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-sage dark:text-sage-soft border border-theme-border flex items-center justify-center shrink-0 group-hover:bg-theme-cta group-hover:text-theme-cta-text group-hover:border-transparent transition-all duration-300 shadow-sm"
            v-html="item.icon"
          ></div>
          <div>
            <h4 class="font-bold text-sm text-theme-primary">{{ item.title }}</h4>
            <p class="text-xs text-theme-muted mt-1 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
