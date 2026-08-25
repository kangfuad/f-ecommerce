<script setup lang="ts">
import { computed } from 'vue'
import { formatDateToIndonesian, calculateDaysBetween, formatDateInput, addDays } from '@/core/utils/date'
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
  <div class="bg-slate-50 dark:bg-zinc-900 border border-theme-border rounded-2xl p-3 sm:p-4 space-y-3 min-w-0">
    <div class="flex items-center justify-between gap-2 min-w-0">
      <span class="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5 truncate">
        <IconCalendarDate :size="15" class="text-sage dark:text-sage-soft shrink-0" />
        <span class="truncate">Pilih Jadwal Sewa</span>
      </span>
      <span class="text-[11px] sm:text-xs font-extrabold text-sage-hover dark:text-sage-soft bg-sage/15 dark:bg-emerald-950/80 border border-sage/30 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
        {{ durationDays }} Hari Sewa
      </span>
    </div>

    <!-- Quick duration presets -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar min-w-0 flex-nowrap">
      <button
        @click="setQuickDuration(1)"
        type="button"
        :class="['text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0', durationDays === 1 ? 'bg-theme-cta text-theme-cta-text border-transparent shadow-sm' : 'bg-white dark:bg-zinc-800 text-theme-muted border-theme-border hover:text-theme-primary']"
      >
        1 Hari
      </button>
      <button
        @click="setQuickDuration(3)"
        type="button"
        :class="['text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0', durationDays === 3 ? 'bg-theme-cta text-theme-cta-text border-transparent shadow-sm' : 'bg-white dark:bg-zinc-800 text-theme-muted border-theme-border hover:text-theme-primary']"
      >
        3 Hari (Weekend)
      </button>
      <button
        @click="setQuickDuration(7)"
        type="button"
        :class="['text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0', durationDays === 7 ? 'bg-theme-cta text-theme-cta-text border-transparent shadow-sm' : 'bg-white dark:bg-zinc-800 text-theme-muted border-theme-border hover:text-theme-primary']"
      >
        7 Hari (-15%)
      </button>
      <button
        @click="setQuickDuration(14)"
        type="button"
        :class="['text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0', durationDays === 14 ? 'bg-theme-cta text-theme-cta-text border-transparent shadow-sm' : 'bg-white dark:bg-zinc-800 text-theme-muted border-theme-border hover:text-theme-primary']"
      >
        14 Hari (-15%)
      </button>
      <button
        @click="setQuickDuration(30)"
        type="button"
        :class="['text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0', durationDays === 30 ? 'bg-theme-cta text-theme-cta-text border-transparent shadow-sm' : 'bg-white dark:bg-zinc-800 text-theme-muted border-theme-border hover:text-theme-primary']"
      >
        30 Hari (-25%)
      </button>
    </div>

    <!-- Date inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 min-w-0">
      <div class="min-w-0">
        <label class="block text-[11px] font-semibold text-theme-muted mb-1 truncate">Mulai Sewa</label>
        <input
          :value="startDate"
          @change="handleStartChange"
          :min="minStartDate"
          type="date"
          class="w-full min-w-0 max-w-full bg-white dark:bg-zinc-800 border border-theme-border rounded-xl px-2.5 sm:px-3 py-2 text-xs font-medium text-theme-primary focus:outline-none focus:border-sage dark:focus:border-sage-soft"
        />
        <p class="text-[10px] text-theme-muted mt-1 truncate">{{ formatDateToIndonesian(startDate) }}</p>
      </div>

      <div class="min-w-0">
        <label class="block text-[11px] font-semibold text-theme-muted mb-1 truncate">Selesai / Pengembalian</label>
        <input
          :value="endDate"
          @change="handleEndChange"
          :min="minEndDate"
          type="date"
          class="w-full min-w-0 max-w-full bg-white dark:bg-zinc-800 border border-theme-border rounded-xl px-2.5 sm:px-3 py-2 text-xs font-medium text-theme-primary focus:outline-none focus:border-sage dark:focus:border-sage-soft"
        />
        <p class="text-[10px] text-theme-muted mt-1 truncate">{{ formatDateToIndonesian(endDate) }}</p>
      </div>
    </div>
  </div>
</template>
