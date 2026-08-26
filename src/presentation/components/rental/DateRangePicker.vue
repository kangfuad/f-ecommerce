<script setup lang="ts">
import { computed } from 'vue'
import { calculateDaysBetween, formatDateInput, addDays } from '@/core/utils/date'
import { IconCalendarDate } from '@/presentation/components/icons'

interface Props {
  startDate: string
  endDate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
}>()

const minStartDate = computed(() => formatDateInput(new Date()))
const minEndDate = computed(() => {
  if (!props.startDate) return minStartDate.value
  return formatDateInput(addDays(new Date(props.startDate), 1))
})

const durationDays = computed(() => {
  if (!props.startDate || !props.endDate) return 1
  return calculateDaysBetween(props.startDate, props.endDate)
})

function handleStartChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:startDate', val)
  if (props.endDate && new Date(props.endDate) <= new Date(val)) {
    emit('update:endDate', formatDateInput(addDays(new Date(val), 1)))
  }
}

function handleEndChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:endDate', val)
}

function setQuickDuration(days: number) {
  const start = props.startDate ? new Date(props.startDate) : new Date()
  const end = addDays(start, days)
  emit('update:startDate', formatDateInput(start))
  emit('update:endDate', formatDateInput(end))
}
</script>

<template>
  <div class="bg-stone-50 dark:bg-stone-900/90 border border-theme-border rounded-2xl p-3 sm:p-3.5 space-y-2.5 min-w-0">
    <!-- Header: Title & Duration Badge -->
    <div class="flex items-center justify-between gap-2 min-w-0">
      <span class="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5 truncate">
        <IconCalendarDate :size="14" class="text-forest dark:text-forest-glow shrink-0" />
        <span class="truncate">Jadwal Sewa Unit</span>
      </span>
      <span class="text-[11px] font-black text-forest dark:text-forest-glow bg-forest/10 dark:bg-emerald-950/80 border border-forest/20 px-2.5 py-0.5 rounded-full shrink-0">
        {{ durationDays }} Hari Sewa
      </span>
    </div>

    <!-- Quick Preset Buttons (Compact 4-column grid, responsive without horizontal scrolling) -->
    <div class="grid grid-cols-4 gap-1.5 text-center">
      <button
        v-for="preset in [
          { days: 1, label: '1 Hari' },
          { days: 3, label: '3 Hari' },
          { days: 7, label: '7 Hari' },
          { days: 14, label: '14 Hari' }
        ]"
        :key="preset.days"
        @click="setQuickDuration(preset.days)"
        type="button"
        :class="[
          'text-[11px] font-bold py-1.5 px-1 rounded-xl border transition-all cursor-pointer truncate',
          durationDays === preset.days
            ? 'bg-[#244E33] dark:bg-emerald-500 text-white dark:text-stone-950 border-transparent shadow-xs font-extrabold'
            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-theme-border hover:bg-stone-100 dark:hover:bg-stone-700'
        ]"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Compact Date Range Side-by-Side (Mulai & Selesai) -->
    <div class="grid grid-cols-2 gap-2 pt-0.5">
      <!-- Start Date -->
      <div class="relative bg-white dark:bg-stone-800 rounded-xl border border-theme-border p-2 focus-within:border-forest dark:focus-within:border-forest-glow transition">
        <span class="block text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Mulai Sewa</span>
        <input
          :value="startDate"
          @change="handleStartChange"
          :min="minStartDate"
          type="date"
          class="w-full bg-transparent text-xs font-bold text-theme-primary outline-none cursor-pointer mt-0.5 p-0"
        />
      </div>

      <!-- End Date -->
      <div class="relative bg-white dark:bg-stone-800 rounded-xl border border-theme-border p-2 focus-within:border-forest dark:focus-within:border-forest-glow transition">
        <span class="block text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Selesai / Kembali</span>
        <input
          :value="endDate"
          @change="handleEndChange"
          :min="minEndDate"
          type="date"
          class="w-full bg-transparent text-xs font-bold text-theme-primary outline-none cursor-pointer mt-0.5 p-0"
        />
      </div>
    </div>
  </div>
</template>
