import { ref, computed } from 'vue'
import { formatDateToISO } from '@/core/utils/date'

// Tomorrow as default start date
const defaultStart = new Date()
defaultStart.setDate(defaultStart.getDate() + 1)

// 3 days later as default end date
const defaultEnd = new Date(defaultStart)
defaultEnd.setDate(defaultEnd.getDate() + 2)

// Global shared state across entire app
const globalStartDate = ref<string>(formatDateToISO(defaultStart))
const globalEndDate = ref<string>(formatDateToISO(defaultEnd))

export function useRentalSession() {
  const startDate = computed({
    get: () => globalStartDate.value,
    set: (val: string) => {
      globalStartDate.value = val
    },
  })

  const endDate = computed({
    get: () => globalEndDate.value,
    set: (val: string) => {
      globalEndDate.value = val
    },
  })

  const durationDays = computed(() => {
    const start = new Date(globalStartDate.value)
    const end = new Date(globalEndDate.value)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return isNaN(days) ? 1 : Math.max(1, days)
  })

  function setPreset(preset: '1_DAY' | '3_DAYS' | '7_DAYS') {
    const start = new Date()
    start.setDate(start.getDate() + 1) // Starts tomorrow
    const end = new Date(start)

    if (preset === '1_DAY') {
      // 1 Day (start and end on the same day)
      end.setDate(start.getDate())
    } else if (preset === '3_DAYS') {
      // 3 Days (Weekend / Project)
      end.setDate(start.getDate() + 2)
    } else if (preset === '7_DAYS') {
      // 1 Week
      end.setDate(start.getDate() + 6)
    }

    globalStartDate.value = formatDateToISO(start)
    globalEndDate.value = formatDateToISO(end)
  }

  function setCustomRange(start: Date | string, end: Date | string) {
    const s = typeof start === 'string' ? start : formatDateToISO(start)
    const e = typeof end === 'string' ? end : formatDateToISO(end)
    globalStartDate.value = s
    globalEndDate.value = e
  }

  return {
    startDate,
    endDate,
    durationDays,
    setPreset,
    setCustomRange,
  }
}
