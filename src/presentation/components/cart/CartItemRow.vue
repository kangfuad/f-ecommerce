<script setup lang="ts">
import { CartItem } from '@/domain/entities/CartItem'
import { formatDateToIndonesian } from '@/core/utils/date'

interface Props {
  item: CartItem
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update-quantity', id: string, newQty: number): void
  (e: 'remove', id: string): void
}>()
</script>

<template>
  <div class="bg-theme-card border border-theme-border rounded-2xl p-3.5 space-y-3 shadow-sm text-theme-primary">
    <div class="flex gap-3 items-start">
      <!-- Thumbnail -->
      <img
        :src="item.product.primaryImage"
        :alt="item.product.name"
        class="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-zinc-800 border border-theme-border shrink-0"
      />

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs sm:text-sm text-theme-primary truncate">
          {{ item.product.name }}
        </h4>
        <p class="text-[11px] text-sage-hover dark:text-sage-soft font-semibold mt-0.5">
          📅 {{ formatDateToIndonesian(item.dateRange.startDate) }} - {{ formatDateToIndonesian(item.dateRange.endDate) }}
          <span class="text-theme-muted font-normal">({{ item.dateRange.durationDays }} Hari)</span>
        </p>
        <p class="text-[10px] text-theme-muted mt-0.5">
          Deposit: {{ item.totalDepositAmount.format() }} (100% Refundable)
        </p>
      </div>

      <!-- Delete Button -->
      <button
        @click="emit('remove', item.id)"
        class="text-theme-muted hover:text-red-500 p-1 transition-colors cursor-pointer"
        aria-label="Hapus item"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>

    <!-- Bottom: Quantity & Total Item Amount -->
    <div class="flex items-center justify-between pt-2 border-t border-theme-border text-xs">
      <div class="flex items-center gap-2">
        <span class="text-theme-muted text-[11px]">Jumlah:</span>
        <div class="flex items-center border border-theme-border rounded-lg bg-slate-50 dark:bg-zinc-800">
          <button
            @click="emit('update-quantity', item.id, item.quantity - 1)"
            class="w-6 h-6 flex items-center justify-center font-bold text-theme-muted hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-theme-primary rounded-l-lg cursor-pointer"
          >
            -
          </button>
          <span class="w-6 text-center font-bold text-theme-primary text-[11px]">{{ item.quantity }}</span>
          <button
            @click="emit('update-quantity', item.id, item.quantity + 1)"
            class="w-6 h-6 flex items-center justify-center font-bold text-theme-muted hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-theme-primary rounded-r-lg cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-theme-muted block">Total Sewa + Deposit</span>
        <span class="font-extrabold text-sage-hover dark:text-sage-soft text-xs sm:text-sm">
          {{ item.totalAmount.format() }}
        </span>
      </div>
    </div>
  </div>
</template>
