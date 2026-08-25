<script setup lang="ts">
import { APP_CONFIG } from '@/core/config/app.config'
import { IconLogo, IconLocation } from '@/presentation/components/icons'
</script>

<template>
  <footer class="bg-[#141211] text-stone-300 mt-16 sm:mt-24 border-t border-stone-800 transition-colors duration-300">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-800/80">
        <!-- Col 1: Brand & Value (5 cols) -->
        <div class="md:col-span-5 space-y-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-forest/20 border border-forest/40 flex items-center justify-center text-forest-soft">
              <IconLogo :size="18" />
            </div>
            <span class="font-extrabold text-xl tracking-tight text-white">
              e-punya<span class="text-forest-soft">sewa</span>
            </span>
          </div>
          <p class="text-xs sm:text-sm text-stone-400 leading-relaxed font-light max-w-sm">
            Platform persewaan perlengkapan kamera, drone, outdoor, dan gadget dengan unit terverifikasi, QC ketat, dan jaminan pengembalian deposit amanah.
          </p>
          <div class="flex items-center gap-2 text-xs text-stone-400 pt-1">
            <IconLocation :size="13" class="text-forest-soft shrink-0" />
            <span>Hub Layanan: Jabodetabek, Bandung, Surabaya, Bali</span>
          </div>
        </div>

        <!-- Col 2: Eksplorasi (3 cols) -->
        <div class="md:col-span-3 space-y-3">
          <p class="font-bold text-xs uppercase tracking-wider text-stone-200">Eksplorasi Katalog</p>
          <ul class="space-y-2 text-xs text-stone-400 font-light">
            <li>
              <router-link to="/katalog" class="hover:text-forest-soft transition">Semua Unit Sewa</router-link>
            </li>
            <li>
              <router-link to="/katalog?category=CAMERA" class="hover:text-forest-soft transition">Kamera & Lensa</router-link>
            </li>
            <li>
              <router-link to="/katalog?category=DRONE_AUDIO" class="hover:text-forest-soft transition">Drone & Audio</router-link>
            </li>
            <li>
              <router-link to="/katalog?category=OUTDOOR" class="hover:text-forest-soft transition">Outdoor & Camping</router-link>
            </li>
          </ul>
        </div>

        <!-- Col 3: Layanan Pelanggan & Bantuan (4 cols) -->
        <div class="md:col-span-4 space-y-3">
          <p class="font-bold text-xs uppercase tracking-wider text-stone-200">Bantuan & Kontak</p>
          <ul class="space-y-1.5 text-xs text-stone-400 font-light mb-2">
            <li>
              <router-link to="/bantuan" class="hover:text-forest-soft transition font-medium">Pusat Bantuan & FAQ Prosedur</router-link>
            </li>
            <li>
              <router-link to="/profil" class="hover:text-forest-soft transition font-medium">Verifikasi Identitas (Bebas Deposit)</router-link>
            </li>
          </ul>
          <div class="space-y-1 text-xs text-stone-400 font-light pt-1 border-t border-stone-800/80">
            <p>WhatsApp CS: <span class="font-semibold text-stone-200">{{ APP_CONFIG.SUPPORT_PHONE }}</span></p>
            <p>Email: <span class="font-semibold text-stone-200">{{ APP_CONFIG.SUPPORT_EMAIL }}</span></p>
          </div>
          <div class="pt-1.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-forest-soft bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-1 rounded-full">
              Garansi Unit Siap Pakai & CS 24/7
            </span>
          </div>
        </div>
      </div>

      <!-- Minimalist Bottom Bar -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© 2026 {{ APP_CONFIG.APP_NAME }}. Seluruh Hak Cipta Dilindungi.</p>
        <div class="flex items-center gap-2 text-[11px] text-stone-400">
          <span>Pembayaran:</span>
          <span class="font-semibold text-stone-300">QRIS</span>
          <span>•</span>
          <span class="font-semibold text-stone-300">BCA VA</span>
          <span>•</span>
          <span class="font-semibold text-stone-300">Mandiri</span>
          <span>•</span>
          <span class="font-semibold text-stone-300">Visa / Master</span>
        </div>
      </div>
    </div>
  </footer>
</template>
