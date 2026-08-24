<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCart } from '@/presentation/composables/useCart'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import CartItemRow from './CartItemRow.vue'
import BaseButton from '../common/BaseButton.vue'
import { APP_CONFIG } from '@/core/config/app.config'
import { formatRupiah } from '@/core/utils/currency'
import {
  IconCartBag,
  IconClose,
  IconCheck,
  IconShieldCheck,
} from '@/presentation/components/icons'

const router = useRouter()

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

function handleProceedToCheckout() {
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
            <h2 class="font-bold text-base text-theme-primary">Keranjang Sewa</h2>
            <p class="text-xs text-theme-muted">{{ totalItemCount }} unit dipilih</p>
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

      <!-- Free Delivery Progress Tracker -->
      <div class="bg-stone-50 dark:bg-stone-900 border-b border-theme-border px-5 py-3 text-xs">
        <div class="flex items-center justify-between font-semibold text-theme-muted mb-1.5">
          <span v-if="isEligibleForFreeDelivery" class="text-forest dark:text-forest-glow font-bold flex items-center gap-1.5">
            <IconCheck :size="14" class="text-forest dark:text-forest-glow" />
            <span>Gratis Pengiriman Aktif</span>
          </span>
          <span v-else class="text-theme-muted">
            Sewa {{ formatRupiah(APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD - subtotalRental.amount) }} lagi untuk Gratis Ongkir
          </span>
          <span class="font-extrabold text-forest dark:text-forest-glow">
            {{ Math.min(100, Math.round((subtotalRental.amount / APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD) * 100)) }}%
          </span>
        </div>
        <div class="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
          <div
            class="bg-theme-cta h-full rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(100, (subtotalRental.amount / APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Content (Items list or empty state) -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        <div v-if="cartItems.length === 0" class="text-center py-16 space-y-4">
          <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-900 border border-theme-border flex items-center justify-center mx-auto text-theme-muted">
            <IconCartBag :size="28" />
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
            @update-dates="handleUpdateDates"
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
            <span v-if="isEligibleForFreeDelivery" class="font-bold text-forest dark:text-forest-glow">GRATIS</span>
            <span v-else class="font-bold text-theme-primary">{{ estimatedDeliveryFee.format() }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-theme-border text-sm font-extrabold text-theme-primary">
            <span>Total Pembayaran</span>
            <span class="text-forest dark:text-forest-glow text-base font-black">{{ grandTotal.format() }}</span>
          </div>
        </div>

        <!-- Proceed Button -->
        <BaseButton
          @click="handleProceedToCheckout"
          variant="primary"
          size="lg"
          class="w-full cursor-pointer shadow-md"
        >
          Lanjut ke Pembayaran ({{ grandTotal.format() }})
        </BaseButton>

        <div class="flex items-center justify-center gap-1.5 text-[10px] text-theme-muted">
          <IconShieldCheck :size="13" class="text-forest dark:text-forest-glow shrink-0" />
          <span>Pembayaran Terenkripsi & Jaminan Refund Deposit Otomatis</span>
        </div>
      </div>
    </div>
  </div>
</template>
