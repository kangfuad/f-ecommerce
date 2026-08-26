<script setup lang="ts">
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconClose,
  IconCheck,
  IconDeliveryTruck,
  IconLocation,
  IconCalendarDate,
  IconShieldCheck,
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
  <div v-if="order" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Card Container -->
    <div class="relative bg-theme-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary p-5 sm:p-6 space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-forest/15 flex items-center justify-center text-forest dark:text-forest-glow">
            <IconCalendarDate :size="18" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-theme-primary">Status & Alur Booking Sewa</h3>
            <p class="text-xs text-stone-500">ID: {{ order.id }} ({{ order.items.length }} Unit)</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Meetup & Provider Info Card -->
      <div class="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Penyedia Sewa:</span>
          <span class="font-black text-theme-primary">{{ order.provider?.name || 'CinemaTech Rental' }}</span>
        </div>
        <div class="pt-2 border-t border-theme-border space-y-1">
          <p class="text-stone-600 dark:text-stone-300">
            <span class="font-bold text-theme-primary">Waktu Temu:</span> {{ order.meetup.scheduleDate }} • {{ order.meetup.scheduleTime }}
          </p>
          <p class="text-stone-600 dark:text-stone-400">
            <span class="font-bold text-theme-primary">Lokasi Serah Terima:</span> {{ order.meetup.locationName }} ({{ order.meetup.locationAddress }})
          </p>
        </div>
      </div>

      <!-- Step Timeline -->
      <div class="space-y-4 pt-2">
        <span class="font-bold text-xs text-stone-500 uppercase tracking-wider block">Tahapan Booking:</span>
        
        <div class="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
          <!-- Step 1 -->
          <div class="relative">
            <span class="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            <p class="font-extrabold text-xs text-theme-primary">Pengajuan Booking Dikirim</p>
            <p class="text-[11px] text-stone-500">Unit dan jadwal temu telah diajukan ke penyedia sewa.</p>
          </div>

          <!-- Step 2 -->
          <div class="relative">
            <span
              :class="[
                'absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black',
                order.lifecycleStatus !== 'PENDING_CONFIRMATION' && order.lifecycleStatus !== 'REJECTED'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-stone-900'
              ]"
            >
              {{ order.lifecycleStatus !== 'PENDING_CONFIRMATION' && order.lifecycleStatus !== 'REJECTED' ? '✓' : '2' }}
            </span>
            <p class="font-extrabold text-xs text-theme-primary">Konfirmasi Jadwal oleh Penyedia</p>
            <p class="text-[11px] text-stone-500">
              {{ order.confirmedAt ? 'Jadwal dan unit telah dikonfirmasi.' : 'Menunggu penyedia menyetujui jadwal.' }}
            </p>
          </div>

          <!-- Step 3 -->
          <div class="relative">
            <span
              :class="[
                'absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black',
                order.lifecycleStatus === 'ACTIVE_RENTAL' || order.lifecycleStatus === 'COMPLETED'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-300 dark:bg-stone-700 text-stone-500'
              ]"
            >
              3
            </span>
            <p class="font-extrabold text-xs text-theme-primary">Serah Terima, TTD Form & Pembayaran Offline</p>
            <p class="text-[11px] text-stone-500">Cek fisik unit bersama, tanda tangani formulir sewa resmi, dan selesaikan pembayaran di lokasi.</p>
          </div>

          <!-- Step 4 -->
          <div class="relative">
            <span
              :class="[
                'absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black',
                order.lifecycleStatus === 'COMPLETED'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-300 dark:bg-stone-700 text-stone-500'
              ]"
            >
              4
            </span>
            <p class="font-extrabold text-xs text-theme-primary">Selesai & Penilaian Reputasi 2 Arah</p>
            <p class="text-[11px] text-stone-500">Pengembalian unit selesai, penyedia upload bill & kedua pihak saling memberikan ulasan.</p>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="w-full py-2.5 rounded-2xl bg-[#244E33] text-white text-xs font-bold"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
