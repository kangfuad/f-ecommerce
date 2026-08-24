<script setup lang="ts">
import { ref } from 'vue'
import { APP_CONFIG } from '@/core/config/app.config'
import { IconLogo, IconLocation } from '@/presentation/components/icons'

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
  <footer class="bg-[#141211] text-stone-300 mt-24 border-t border-stone-800/80 transition-colors duration-300">
    <!-- Newsletter section -->
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      <div class="bg-[#1F1C1B] border border-stone-800 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div class="text-center md:text-left max-w-lg">
          <span class="text-xs uppercase font-extrabold tracking-widest text-forest-soft dark:text-sage-soft bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-full">
            Dapatkan Promo Spesial
          </span>
          <h3 class="font-display text-2xl sm:text-3xl font-bold mt-3 text-white">
            Voucher Diskon Sewa Pertama 25%
          </h3>
          <p class="text-stone-400 text-sm mt-2 font-light">
            Daftarkan email Anda untuk info rilis unit baru, promo akhir pekan, dan tips perlengkapan.
          </p>
        </div>

        <form @submit.prevent="handleSubscribe" class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Masukkan email Anda..."
            class="w-full sm:w-72 bg-[#141211] border border-stone-700 rounded-full px-5 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-forest-soft"
          />
          <button
            type="submit"
            class="bg-forest hover:bg-forest-hover text-white font-extrabold text-sm rounded-full px-7 py-3 transition-all cursor-pointer whitespace-nowrap shadow-md"
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
            <div class="w-9 h-9 rounded-xl bg-forest/20 border border-forest/40 flex items-center justify-center text-sage-soft">
              <IconLogo :size="20" />
            </div>
            <span class="font-extrabold text-2xl tracking-tight text-white">
              e-punya<span class="text-sage-soft">sewa</span>
            </span>
          </div>
          <p class="text-stone-400 text-sm leading-relaxed max-w-sm font-light">
            Solusi cerdas sewa perlengkapan fotografi, outdoor, audio, dan teknologi tanpa perlu membeli mahal. Praktis, terjamin, dan amanah.
          </p>
          <div class="flex items-center gap-2 text-xs text-stone-400">
            <IconLocation :size="14" class="text-sage-soft shrink-0" />
            <span>Layanan: Jabodetabek, Bandung, Surabaya, Bali</span>
          </div>
        </div>

        <!-- Col 2: Kategori Sewa -->
        <div>
          <p class="font-bold text-sm text-white mb-4">Kategori Sewa</p>
          <ul class="space-y-2.5 text-sm text-stone-400 font-light">
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
          <ul class="space-y-2.5 text-sm text-stone-400 font-light">
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
          <ul class="space-y-2.5 text-sm text-stone-400 font-light">
            <li><span>WhatsApp: {{ APP_CONFIG.SUPPORT_PHONE }}</span></li>
            <li><span>Email: {{ APP_CONFIG.SUPPORT_EMAIL }}</span></li>
            <li><span>Jam Operasional: 08.00 - 22.00 WIB</span></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-stone-800/80 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© 2026 {{ APP_CONFIG.APP_NAME }}. Seluruh Hak Cipta Dilindungi.</p>
        <div class="flex items-center gap-3">
          <span class="border border-stone-700 bg-stone-800/80 px-2 py-1 rounded text-[10px] text-stone-400">QRIS</span>
          <span class="border border-stone-700 bg-stone-800/80 px-2 py-1 rounded text-[10px] text-stone-400">BCA VA</span>
          <span class="border border-stone-700 bg-stone-800/80 px-2 py-1 rounded text-[10px] text-stone-400">MANDIRI</span>
          <span class="border border-stone-700 bg-stone-800/80 px-2 py-1 rounded text-[10px] text-stone-400">VISA / MASTER</span>
        </div>
      </div>
    </div>
  </footer>
</template>
