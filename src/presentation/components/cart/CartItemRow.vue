<script setup lang="ts">
import { ref } from 'vue'
import { CartItem } from '@/domain/entities/CartItem'
import { formatDateToIndonesian, formatDateToISO } from '@/core/utils/date'
import {
  IconTrash,
  IconCalendarDate,
  IconCheck,
  IconClose,
} from '@/presentation/components/icons'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update-quantity', id: string, newQty: number): void
  (e: 'update-dates', id: string, startDate: string, endDate: string): void
  (e: 'remove', id: string): void
}>()

const isEditingDates = ref(false)
const editStart = ref(formatDateToISO(props.item.dateRange.startDate))
const editEnd = ref(formatDateToISO(props.item.dateRange.endDate))

function startEdit() {
  editStart.value = formatDateToISO(props.item.dateRange.startDate)
  editEnd.value = formatDateToISO(props.item.dateRange.endDate)
  isEditingDates.value = true
}

function cancelEdit() {
  isEditingDates.value = false
}

function saveDates() {
  if (editStart.value && editEnd.value) {
    emit('update-dates', props.item.id, editStart.value, editEnd.value)
    isEditingDates.value = false
  }
}
</script>

<template>
  <div class="bg-theme-card border border-theme-border rounded-2xl p-3.5 space-y-3 shadow-sm text-theme-primary">
    <div class="flex gap-3 items-start">
      <!-- Thumbnail -->
      <img
        :src="item.product.primaryImage"
        :alt="item.product.name"
        class="w-16 h-16 rounded-xl object-cover bg-stone-100 dark:bg-stone-900 border border-theme-border shrink-0"
      />

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs sm:text-sm text-theme-primary truncate">
          {{ item.product.name }}
        </h4>

        <!-- Active Dates with Edit Trigger -->
        <div v-if="!isEditingDates" class="mt-1">
          <p class="text-[11px] text-forest dark:text-forest-glow font-bold flex items-center gap-1">
            <IconCalendarDate :size="12" />
            <span>{{ formatDateToIndonesian(item.dateRange.startDate) }} - {{ formatDateToIndonesian(item.dateRange.endDate) }}</span>
            <span class="text-stone-500 font-normal">({{ item.dateRange.durationDays }} Hari)</span>
          </p>
          <button
            @click="startEdit"
            class="text-[10px] text-stone-500 hover:text-forest dark:hover:text-forest-glow underline font-bold mt-0.5 cursor-pointer block"
          >
            Ubah Tanggal Sewa
          </button>
        </div>

        <!-- Inline Date Range Editor -->
        <div v-else class="mt-2 p-2 bg-stone-50 dark:bg-stone-900 rounded-xl border border-theme-border space-y-2">
          <div class="grid grid-cols-2 gap-1.5">
            <div>
              <label class="text-[9px] font-bold text-stone-500 block">Mulai</label>
              <input
                v-model="editStart"
                type="date"
                :min="formatDateToISO(new Date())"
                class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-lg px-1.5 py-1 text-[11px] text-theme-primary focus:outline-none"
              />
            </div>
            <div>
              <label class="text-[9px] font-bold text-stone-500 block">Selesai</label>
              <input
                v-model="editEnd"
                type="date"
                :min="editStart"
                class="w-full bg-white dark:bg-stone-800 border border-theme-border rounded-lg px-1.5 py-1 text-[11px] text-theme-primary focus:outline-none"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-1.5 pt-1">
            <button
              @click="cancelEdit"
              class="px-2 py-0.5 text-[10px] font-bold text-stone-500 hover:text-theme-primary rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="saveDates"
              class="px-2.5 py-0.5 text-[10px] font-black bg-forest hover:bg-forest-hover text-white rounded shadow-xs cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </div>

        <p class="text-[10px] text-stone-500 mt-1">
          Deposit: {{ item.totalDepositAmount.format() }} (100% Refundable)
        </p>
      </div>

      <!-- Delete Button -->
      <button
        @click="emit('remove', item.id)"
        class="text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
        aria-label="Hapus item"
      >
        <IconTrash :size="15" />
      </button>
    </div>

    <!-- Bottom: Quantity & Total Item Amount -->
    <div class="flex items-center justify-between pt-2 border-t border-theme-border text-xs">
      <div class="flex items-center gap-2">
        <span class="text-stone-500 text-[11px]">Jumlah:</span>
        <div class="flex items-center border border-theme-border rounded-lg bg-stone-50 dark:bg-stone-900">
          <button
            @click="emit('update-quantity', item.id, item.quantity - 1)"
            class="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-theme-primary rounded-l-lg cursor-pointer"
          >
            -
          </button>
          <span class="w-6 text-center font-bold text-theme-primary text-[11px]">{{ item.quantity }}</span>
          <button
            @click="emit('update-quantity', item.id, item.quantity + 1)"
            class="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-theme-primary rounded-r-lg cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-stone-500 block">Total Sewa + Deposit</span>
        <span class="font-black text-forest dark:text-forest-glow text-xs sm:text-sm">
          {{ item.totalAmount.format() }}
        </span>
      </div>
    </div>
  </div>
</template>
