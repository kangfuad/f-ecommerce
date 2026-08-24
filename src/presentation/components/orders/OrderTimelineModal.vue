<script setup lang="ts">
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import { formatRupiah } from '@/core/utils/currency'
import type { OrderDto } from '@/infrastructure/services/api/OrderService'
import {
  IconClose,
  IconCheck,
  IconDeliveryTruck,
  IconLocation,
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
            <IconDeliveryTruck :size="18" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-theme-primary">Status & Pelacakan Rental</h3>
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

      <!-- Items Summary in this Tracking Package -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
          <span>Daftar Unit Dalam Pengiriman:</span>
          <span class="text-forest dark:text-forest-glow">{{ order.items.length }} Item Perlengkapan</span>
        </div>

        <div class="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-theme-border text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img
                :src="item.primaryImage"
                :alt="item.productName"
                class="w-8 h-8 rounded-lg object-cover border border-theme-border shrink-0"
              />
              <span class="font-bold text-theme-primary truncate">{{ item.productName }}</span>
            </div>
            <span class="font-semibold text-stone-500 shrink-0 ml-2">Qty: {{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Courier / Pickup Details Card -->
      <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-theme-border space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Metode Serah Terima:</span>
          <span class="font-black text-forest dark:text-forest-glow">
            {{ order.customer.deliveryMethod === 'DELIVERY' ? 'Diantar Kurir Dedicated' : 'Diambil di Hub' }}
          </span>
        </div>

        <div v-if="order.customer.deliveryMethod === 'DELIVERY' && order.tracking?.courierName" class="space-y-1 pt-1 border-t border-theme-border">
          <p class="text-stone-600 dark:text-stone-400">
            <span class="font-bold text-theme-primary">Kurir:</span> {{ order.tracking.courierName }}
          </p>
          <p v-if="order.tracking.resiNumber" class="text-stone-600 dark:text-stone-400">
            <span class="font-bold text-theme-primary">No. Resi Armada:</span> {{ order.tracking.resiNumber }}
          </p>
          <p class="text-stone-600 dark:text-stone-400">
            <span class="font-bold text-theme-primary">Alamat Tujuan:</span> {{ order.customer.deliveryAddress }}
          </p>
        </div>

        <div v-else-if="order.customer.pickupHub" class="space-y-1 pt-1 border-t border-theme-border">
          <div class="flex items-center gap-1 text-theme-primary font-bold">
            <IconLocation :size="12" class="text-forest" />
            <span>{{ order.customer.pickupHub }}</span>
          </div>
          <p class="text-[11px] text-stone-500">Jam Operasional Hub: 08:00 - 21:00 WIB</p>
        </div>
      </div>

      <!-- Live Stepper Timeline -->
      <div class="space-y-3">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-stone-500">Perjalanan Unit Sewa</h4>
        <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
          <div
            v-for="(step, idx) in order.tracking?.steps || []"
            :key="idx"
            class="relative flex items-start gap-3 group"
          >
            <!-- Step Bullet Icon -->
            <div
              :class="[
                'absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                step.completed
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
              ]"
            >
              <IconCheck v-if="step.completed" :size="10" />
              <span v-else>{{ idx + 1 }}</span>
            </div>

            <!-- Step Content -->
            <div class="space-y-0.5">
              <p
                :class="[
                  'text-xs font-bold transition-colors',
                  step.isCurrent
                    ? 'text-forest dark:text-forest-glow font-black'
                    : step.completed
                    ? 'text-theme-primary'
                    : 'text-stone-400'
                ]"
              >
                {{ step.title }}
                <span
                  v-if="step.isCurrent"
                  class="ml-2 text-[9px] px-2 py-0.5 rounded-full bg-forest/15 text-forest dark:text-forest-glow font-extrabold"
                >
                  Status Saat Ini
                </span>
              </p>
              <p class="text-[11px] text-stone-500">{{ step.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-3 border-t border-theme-border flex items-center justify-between gap-3">
        <a
          :href="`https://wa.me/6281234567890?text=Halo%20Admin%20e-punyasewa,%20saya%20ingin%20menanyakan%20status%20pesanan%20dengan%20ID:%20${order.id}`"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 text-center py-2.5 px-4 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-theme-primary transition cursor-pointer"
        >
          Hubungi CS via WA
        </a>
        <button
          @click="emit('close')"
          class="flex-1 py-2.5 px-4 rounded-full bg-[#244E33] hover:bg-[#1B3B26] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-stone-950 text-xs font-black transition cursor-pointer text-center"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
