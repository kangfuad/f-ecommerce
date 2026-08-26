<script setup lang="ts">
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconClose,
  IconCheck,
  IconClock,
  IconShieldCheck,
  IconLocation,
  IconCalendarDate,
} from '@/presentation/components/icons'

interface Props {
  order: OrderDto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

useBodyScrollLock(() => !!props.order)
</script>

<template>
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card -->
    <div class="relative bg-theme-card text-theme-primary rounded-3xl max-w-md w-full shadow-2xl border border-theme-border z-10 animate-fade-up p-5 sm:p-6 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div>
          <h3 class="font-extrabold text-sm sm:text-base text-theme-primary">Informasi Transaksi Offline</h3>
          <p class="text-xs text-stone-500 font-mono">#{{ order.id }}</p>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        >
          <IconClose :size="14" />
        </button>
      </div>

      <!-- Settlement info -->
      <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2 text-emerald-900 dark:text-emerald-200">
        <p class="font-bold text-sm">Direct Settlement di Lokasi</p>
        <p class="text-[11px] leading-relaxed">
          Biaya sewa dibayarkan langsung kepada penyedia sewa saat serah terima unit di lokasi yang telah disepakati.
        </p>
      </div>

      <!-- Meetup details -->
      <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs space-y-1.5">
        <span class="text-[10px] text-stone-400 font-bold uppercase block">Jadwal & Tempat Serah Terima:</span>
        <p class="font-bold text-theme-primary flex items-center gap-1.5">
          <IconCalendarDate :size="13" class="text-forest dark:text-forest-glow" />
          <span>{{ order.meetup.scheduleDate }} • {{ order.meetup.scheduleTime }}</span>
        </p>
        <p class="text-stone-500 flex items-start gap-1.5 text-[11px]">
          <IconLocation :size="13" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
          <span>{{ order.meetup.locationName }} ({{ order.meetup.locationAddress }})</span>
        </p>
      </div>

      <!-- Price -->
      <div class="flex justify-between items-center pt-2 border-t border-theme-border text-xs">
        <span class="text-stone-500">Estimasi Total Tagihan:</span>
        <span class="font-black text-base font-mono text-forest dark:text-forest-glow">
          {{ formatRupiah(order.pricing.grandTotal || order.pricing.subtotalRental) }}
        </span>
      </div>

      <div class="pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="w-full py-2.5 rounded-2xl bg-[#244E33] text-white text-xs font-bold"
        >
          Mengerti
        </button>
      </div>
    </div>
  </div>
</template>
