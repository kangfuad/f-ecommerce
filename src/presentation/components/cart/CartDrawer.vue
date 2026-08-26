<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCart } from '@/presentation/composables/useCart'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import CartItemRow from './CartItemRow.vue'
import BaseButton from '../common/BaseButton.vue'
import {
  IconCartBag,
  IconClose,
  IconShieldCheck,
  IconCalendarDate,
  IconLocation,
} from '@/presentation/components/icons'

const router = useRouter()

const {
  cartItems,
  isCartOpen,
  totalItemCount,
  subtotalRental,
  updateQuantity,
  updateItemDates,
  removeItem,
  closeCart,
} = useCart()

// Lock background page scroll when cart drawer is open
useBodyScrollLock(isCartOpen)

async function handleUpdateDates(id: string, start: string, end: string) {
  try {
    await updateItemDates(id, start, end)
  } catch (e) {
    console.error(e)
  }
}

function handleProceedToBooking() {
  closeCart()
  router.push('/checkout')
}
</script>

<template>
  <div>
    <!-- Backdrop -->
    <div
      v-if="isCartOpen"
      @click="closeCart"
      class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity"
    ></div>

    <!-- Drawer Panel -->
    <div
      :class="[
        'fixed inset-y-0 right-0 max-w-md w-full bg-theme-card z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-theme-border text-theme-primary',
        isCartOpen ? 'translate-x-0' : 'translate-x-full',
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-theme-border">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center text-forest dark:text-forest-glow">
            <IconCartBag :size="18" />
          </div>
          <div>
            <h2 class="font-bold text-base text-theme-primary">Daftar Booking Sewa</h2>
            <p class="text-xs text-theme-muted">{{ totalItemCount }} unit perlengkapan dipilih</p>
          </div>
        </div>

        <button
          @click="closeCart"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
          aria-label="Tutup Keranjang"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Info Banner: Direct Booking Notice -->
      <div class="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-500/20 px-5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <IconCalendarDate :size="14" class="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span class="text-[11px] leading-tight">
          Reservasi unit sewa online. Transaksi & serah terima dilakukan saat jadwal temu.
        </span>
      </div>

      <!-- Content (Items list or empty state) -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        <div v-if="cartItems.length === 0" class="text-center py-16 space-y-4">
          <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-900 border border-theme-border flex items-center justify-center mx-auto text-theme-muted">
            <IconCartBag :size="28" />
          </div>
          <div>
            <p class="font-bold text-sm text-theme-primary">Daftar Booking Masih Kosong</p>
            <p class="text-xs text-theme-muted mt-1">Pilih perlengkapan dan tentukan tanggal sewa Anda.</p>
          </div>
          <BaseButton @click="closeCart" variant="primary" size="sm">
            Mulai Eksplorasi Unit
          </BaseButton>
        </div>

        <div v-else class="space-y-3">
          <CartItemRow
            v-for="item in cartItems"
            :key="item.id"
            :item="item"
            @update-quantity="updateQuantity"
            @update-dates="handleUpdateDates"
            @remove="removeItem"
          />
        </div>
      </div>

      <!-- Footer / Booking Estimation Summary -->
      <div v-if="cartItems.length > 0" class="p-5 bg-theme-card border-t border-theme-border space-y-3">
        <div class="space-y-1.5 text-xs text-theme-muted">
          <div class="flex justify-between">
            <span>Estimasi Biaya Sewa</span>
            <span class="font-bold text-theme-primary font-mono text-sm">{{ subtotalRental.format() }}</span>
          </div>
          <div class="flex justify-between text-[11px] text-stone-500">
            <span>Metode Pembayaran</span>
            <span class="font-semibold text-theme-primary">Direct Settlement (Saat Serah Terima)</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-theme-border text-sm font-extrabold text-theme-primary">
            <span>Estimasi Total Sewa</span>
            <span class="text-forest dark:text-forest-glow text-base font-black font-mono">{{ subtotalRental.format() }}</span>
          </div>
        </div>

        <BaseButton
          @click="handleProceedToBooking"
          variant="primary"
          size="lg"
          class="w-full cursor-pointer shadow-md text-xs sm:text-sm font-black"
        >
          <span>Lanjut ke Pengajuan Booking</span>
        </BaseButton>

        <div class="flex items-center justify-center gap-1.5 text-[10px] text-theme-muted">
          <IconShieldCheck :size="13" class="text-forest dark:text-forest-glow shrink-0" />
          <span>Tanpa Tagihan In-App • Konfirmasi Jadwal & Lokasi Langsung</span>
        </div>
      </div>
    </div>
  </div>
</template>
