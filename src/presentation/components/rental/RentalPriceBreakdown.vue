<script setup lang="ts">
import { RentalBooking } from '@/domain/entities/RentalBooking'

interface Props {
  booking: RentalBooking
}

defineProps<Props>()
</script>

<template>
  <div class="bg-slate-50 dark:bg-zinc-900 border border-theme-border rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-xs text-theme-primary min-w-0">
    <h4 class="text-xs font-bold uppercase tracking-wider text-theme-primary flex flex-wrap items-center justify-between gap-1">
      <span>Estimasi Biaya Sewa</span>
      <span class="text-[10px] font-normal text-theme-muted">Tanpa Biaya Tersembunyi</span>
    </h4>

    <div class="space-y-2 text-xs text-theme-muted divide-y divide-slate-200 dark:divide-zinc-800">
      <!-- Base rental price -->
      <div class="flex items-start justify-between gap-2 pt-1 min-w-0">
        <span class="min-w-0 break-words">
          Sewa {{ booking.durationDays }} Hari ({{ booking.product.dailyRate.format() }} × {{ booking.quantity }} unit)
        </span>
        <span class="font-bold text-theme-primary shrink-0 text-right">{{ booking.baseRentalPrice.format() }}</span>
      </div>

      <!-- Long term discount if applicable -->
      <div v-if="booking.discountPercentage > 0" class="flex items-center justify-between gap-2 pt-2 text-emerald-600 dark:text-emerald-400 min-w-0">
        <span class="flex items-center gap-1 min-w-0 flex-wrap">
          <span>Diskon Durasi ({{ Math.round(booking.discountPercentage * 100) }}%)</span>
          <span class="text-[10px] bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/40">Hemat</span>
        </span>
        <span class="font-bold shrink-0 text-right">- {{ booking.discountAmount.format() }}</span>
      </div>

      <!-- Total Estimation -->
      <div class="flex items-center justify-between gap-2 pt-2.5 text-sm font-extrabold text-theme-primary border-t border-slate-200 dark:border-zinc-800 min-w-0">
        <div class="min-w-0">
          <p class="text-[11px] text-theme-muted font-normal">Estimasi Total Biaya Sewa</p>
          <p class="text-sm sm:text-base text-forest dark:text-forest-glow font-black font-mono truncate">
            {{ booking.netRentalPrice.format() }}
          </p>
        </div>
        <div class="text-right text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
          <span>Pelunasan di Lokasi</span>
        </div>
      </div>
    </div>
  </div>
</template>
