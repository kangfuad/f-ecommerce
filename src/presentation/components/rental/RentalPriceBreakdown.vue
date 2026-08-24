<script setup lang="ts">
import { RentalBooking } from '@/domain/entities/RentalBooking'

interface Props {
  booking: RentalBooking
  includeInsurance: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-insurance'): void
}>()
</script>

<template>
  <div class="bg-slate-50 dark:bg-zinc-900 border border-theme-border rounded-2xl p-4 space-y-3 shadow-sm text-theme-primary">
    <h4 class="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center justify-between">
      <span>Rincian Biaya Sewa</span>
      <span class="text-[10px] font-normal text-theme-muted">Transparan & Tanpa Biaya Tersembunyi</span>
    </h4>

    <div class="space-y-2 text-xs text-theme-muted divide-y divide-slate-200 dark:divide-zinc-800">
      <!-- Base rental price -->
      <div class="flex items-center justify-between pt-1">
        <span>
          Sewa {{ booking.durationDays }} Hari ({{ booking.product.dailyRate.format() }} × {{ booking.quantity }} unit)
        </span>
        <span class="font-bold text-theme-primary">{{ booking.baseRentalPrice.format() }}</span>
      </div>

      <!-- Long term discount if applicable -->
      <div v-if="booking.discountPercentage > 0" class="flex items-center justify-between pt-2 text-emerald-600 dark:text-emerald-400">
        <span class="flex items-center gap-1">
          <span>Diskon Durasi ({{ Math.round(booking.discountPercentage * 100) }}%)</span>
          <span class="text-[10px] bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/40">Hemat</span>
        </span>
        <span class="font-bold">- {{ booking.discountAmount.format() }}</span>
      </div>

      <!-- Insurance Fee with Toggle -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <input
            id="insurance-toggle"
            type="checkbox"
            :checked="includeInsurance"
            @change="emit('toggle-insurance')"
            class="w-4 h-4 rounded bg-white dark:bg-zinc-800 border-theme-border text-sage dark:text-sage-soft focus:ring-sage cursor-pointer"
          />
          <label for="insurance-toggle" class="cursor-pointer">
            <span class="font-semibold text-theme-primary block">Asuransi Perlindungan Unit</span>
            <span class="text-[10px] text-theme-muted block">Proteksi goresan & kerusakan wajar</span>
          </label>
        </div>
        <span class="font-bold text-theme-primary">{{ booking.insuranceFee.format() }}</span>
      </div>

      <!-- Refundable Deposit -->
      <div class="flex items-start justify-between pt-2">
        <div>
          <span class="font-semibold text-theme-primary block">Deposit Jaminan Sewa</span>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">✓ 100% Dikembalikan setelah unit kembali</span>
        </div>
        <span class="font-bold text-theme-primary">{{ booking.refundableDeposit.format() }}</span>
      </div>

      <!-- Total Checkout -->
      <div class="flex items-center justify-between pt-3 text-sm font-extrabold text-theme-primary border-t border-slate-200 dark:border-zinc-800">
        <div>
          <p class="text-xs text-theme-muted font-normal">Total Pembayaran Awal</p>
          <p class="text-base text-sage-hover dark:text-sage-soft font-black">{{ booking.totalCheckoutAmount.format() }}</p>
        </div>
        <div class="text-right text-[10px] text-theme-muted font-normal">
          <span>(Termasuk Deposit {{ booking.refundableDeposit.format() }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
