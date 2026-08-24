<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '@/presentation/composables/useCart'
import CartItemRow from './CartItemRow.vue'
import BaseButton from '../common/BaseButton.vue'
import { APP_CONFIG } from '@/core/config/app.config'
import { formatRupiah } from '@/core/utils/currency'

const {
  cartItems,
  isCartOpen,
  totalItemCount,
  subtotalRental,
  totalDeposit,
  isEligibleForFreeDelivery,
  estimatedDeliveryFee,
  grandTotal,
  updateQuantity,
  removeItem,
  closeCart,
} = useCart()

const isCheckingOut = ref(false)
const checkoutSuccess = ref(false)

function handleProceedToCheckout() {
  isCheckingOut.value = true
  setTimeout(() => {
    isCheckingOut.value = false
    checkoutSuccess.value = true
    setTimeout(() => {
      checkoutSuccess.value = false
      closeCart()
    }, 2000)
  }, 1500)
}
</script>

<template>
  <div v-if="isCartOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      @click="closeCart"
      class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Slide-over panel -->
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-theme-page shadow-2xl flex flex-col justify-between border-l border-theme-border animate-slide-left text-theme-primary">
        <!-- Header -->
        <div class="p-5 bg-theme-card border-b border-theme-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-theme-border text-sage dark:text-sage-soft flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-theme-primary">Keranjang Sewa</h3>
              <p class="text-[11px] text-theme-muted">{{ totalItemCount }} Item Dipilih</p>
            </div>
          </div>

          <button
            @click="closeCart"
            class="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            aria-label="Tutup Keranjang"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Free Delivery Progress Tracker -->
        <div class="bg-slate-50 dark:bg-zinc-900 border-b border-theme-border px-5 py-3 text-xs">
          <div class="flex items-center justify-between font-semibold text-theme-muted mb-1.5">
            <span v-if="isEligibleForFreeDelivery" class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              🎉 Selamat! Anda Mendapatkan Gratis Pengiriman
            </span>
            <span v-else class="text-theme-muted">
              Sewa {{ formatRupiah(APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD - subtotalRental.amount) }} lagi untuk Gratis Ongkir
            </span>
            <span class="font-extrabold text-sage-hover dark:text-sage-soft">
              {{ Math.min(100, Math.round((subtotalRental.amount / APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD) * 100)) }}%
            </span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-theme-cta h-full rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, (subtotalRental.amount / APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Content (Items list or empty state) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          <div v-if="cartItems.length === 0" class="text-center py-16 space-y-4">
            <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-900 border border-theme-border flex items-center justify-center mx-auto text-theme-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <div>
              <p class="font-bold text-sm text-theme-primary">Keranjang Sewa Kosong</p>
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
              @remove="removeItem"
            />
          </div>
        </div>

        <!-- Footer / Order Summary -->
        <div v-if="cartItems.length > 0" class="p-5 bg-theme-card border-t border-theme-border space-y-3">
          <div class="space-y-1.5 text-xs text-theme-muted">
            <div class="flex justify-between">
              <span>Subtotal Biaya Sewa</span>
              <span class="font-bold text-theme-primary">{{ subtotalRental.format() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Total Deposit (100% Refundable)</span>
              <span class="font-bold text-theme-primary">{{ totalDeposit.format() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Ongkos Kirim / Kurir</span>
              <span v-if="isEligibleForFreeDelivery" class="font-bold text-emerald-600 dark:text-emerald-400">GRATIS</span>
              <span v-else class="font-bold text-theme-primary">{{ estimatedDeliveryFee.format() }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-theme-border text-sm font-extrabold text-theme-primary">
              <span>Total Pembayaran</span>
              <span class="text-sage-hover dark:text-sage-soft text-base font-black">{{ grandTotal.format() }}</span>
            </div>
          </div>

          <!-- Checkout Success Message -->
          <div v-if="checkoutSuccess" class="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-center text-xs font-bold border border-emerald-300 dark:border-emerald-800/60">
            🎉 Booking Sewa Berhasil Dibuat! Mengarahkan ke Pembayaran...
          </div>

          <!-- Proceed Button -->
          <BaseButton
            v-else
            @click="handleProceedToCheckout"
            :loading="isCheckingOut"
            variant="primary"
            size="lg"
            class="w-full cursor-pointer shadow-md"
          >
            Lanjut ke Pembayaran ({{ grandTotal.format() }})
          </BaseButton>

          <p class="text-[10px] text-center text-theme-muted">
            🔒 Pembayaran Terenkripsi & Jaminan Pengembalian Deposit Otomatis
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
