<script setup lang="ts">
import { ref } from 'vue'
import { APP_CONFIG } from '@/core/config/app.config'

const email = ref('')
const isSubscribed = ref(false)

function handleSubscribe() {
  if (!email.value) return
  isSubscribed.value = true
  setTimeout(() => {
    isSubscribed.value = false
    email.value = ''
  }, 2500)
}
</script>

<template>
  <footer class="bg-slate-900 dark:bg-zinc-950 text-white dark:text-ash-gray mt-24 border-t border-slate-800 dark:border-theme-border transition-colors duration-300">
    <!-- Newsletter section -->
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      <div class="bg-slate-800/80 dark:bg-slate-card border border-slate-700/80 dark:border-theme-border rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div class="text-center md:text-left max-w-lg">
          <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400 dark:text-sage-soft bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-full">
            Dapatkan Promo Spesial
          </span>
          <h3 class="font-display text-2xl sm:text-3xl font-bold mt-3 text-white">
            Voucher Diskon Sewa Pertama 25%
          </h3>
          <p class="text-slate-300 dark:text-ash-gray text-sm mt-2 font-light">
            Daftarkan email Anda untuk info rilis unit baru, promo akhir pekan, dan tips perlengkapan.
          </p>
        </div>

        <form @submit.prevent="handleSubscribe" class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Masukkan email Anda..."
            class="w-full sm:w-72 bg-slate-900/90 dark:bg-zinc-900 border border-slate-700 dark:border-theme-border rounded-full px-5 py-3 text-sm text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-sage dark:focus:border-sage-soft"
          />
          <button
            type="submit"
            class="bg-sage hover:bg-sage-hover text-white font-extrabold text-sm rounded-full px-7 py-3 transition-all cursor-pointer whitespace-nowrap shadow-md"
          >
            {{ isSubscribed ? 'Terdaftar ✓' : 'Klaim Voucher' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Main footer links -->
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <!-- Col 1: Brand -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-sage/20 border border-sage/40 flex items-center justify-center text-sage-soft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <span class="font-extrabold text-2xl tracking-tight text-white">
              e-punya<span class="text-sage-soft">sewa</span>
            </span>
          </div>
          <p class="text-slate-400 dark:text-ash-gray text-sm leading-relaxed max-w-sm font-light">
            Solusi cerdas sewa perlengkapan fotografi, outdoor, audio, dan teknologi tanpa perlu membeli mahal. Praktis, terjamin, dan amanah.
          </p>
          <div class="flex items-center gap-3 text-xs text-slate-400 dark:text-ash-gray">
            <span>📍 Layanan: Jabodetabek, Bandung, Surabaya, Bali</span>
          </div>
        </div>

        <!-- Col 2: Kategori Sewa -->
        <div>
          <p class="font-bold text-sm text-white mb-4">Kategori Sewa</p>
          <ul class="space-y-2.5 text-sm text-slate-400 dark:text-ash-gray font-light">
            <li><a href="#" class="hover:text-sage-soft transition">Kamera & Lensa</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Drone & Gimbal</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Tenda & Camping</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">MacBook & iPad</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Jas & Gaun Pesta</a></li>
          </ul>
        </div>

        <!-- Col 3: Bantuan & Jaminan -->
        <div>
          <p class="font-bold text-sm text-white mb-4">Bantuan & Jaminan</p>
          <ul class="space-y-2.5 text-sm text-slate-400 dark:text-ash-gray font-light">
            <li><a href="#" class="hover:text-sage-soft transition">Cara Sewa Barang</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Ketentuan Deposit</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Asuransi Kerusakan</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">Pengiriman & Pickup</a></li>
            <li><a href="#" class="hover:text-sage-soft transition">FAQ / Bantuan</a></li>
          </ul>
        </div>

        <!-- Col 4: Hubungi Kami -->
        <div>
          <p class="font-bold text-sm text-white mb-4">Hubungi Kami</p>
          <ul class="space-y-2.5 text-sm text-slate-400 dark:text-ash-gray font-light">
            <li><span>WhatsApp: {{ APP_CONFIG.SUPPORT_PHONE }}</span></li>
            <li><span>Email: {{ APP_CONFIG.SUPPORT_EMAIL }}</span></li>
            <li><span>Jam Operasional: 08.00 - 22.00 WIB</span></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-slate-800 dark:border-zinc-900 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 {{ APP_CONFIG.APP_NAME }}. Seluruh Hak Cipta Dilindungi.</p>
        <div class="flex items-center gap-3">
          <span class="border border-slate-700 bg-slate-800/80 px-2 py-1 rounded text-[10px] text-slate-400">QRIS</span>
          <span class="border border-slate-700 bg-slate-800/80 px-2 py-1 rounded text-[10px] text-slate-400">BCA VA</span>
          <span class="border border-slate-700 bg-slate-800/80 px-2 py-1 rounded text-[10px] text-slate-400">MANDIRI</span>
          <span class="border border-slate-700 bg-slate-800/80 px-2 py-1 rounded text-[10px] text-slate-400">VISA / MASTER</span>
        </div>
      </div>
    </div>
  </footer>
</template>
