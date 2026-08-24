<script setup lang="ts">
import { ref } from 'vue'
import { formatDateToISO, formatDateToIndonesian } from '@/core/utils/date'
import { IconCalendarDate, IconClose, IconCheck } from '@/presentation/components/icons'

const emit = defineEmits<{
  (e: 'select-dates', startDate: string, endDate: string): void
  (e: 'close'): void
}>()

// Default tomorrow
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

// 3 days later
const threeDays = new Date(tomorrow)
threeDays.setDate(threeDays.getDate() + 2)

const customStart = ref(formatDateToISO(tomorrow))
const customEnd = ref(formatDateToISO(threeDays))
const isCustomMode = ref(false)

function handlePreset(days: number) {
  const start = new Date()
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + (days - 1))

  emit('select-dates', formatDateToISO(start), formatDateToISO(end))
}

function handleCustomSubmit() {
  if (customStart.value && customEnd.value) {
    emit('select-dates', customStart.value, customEnd.value)
  }
}
</script>

<template>
  <div
    @click.stop
    class="absolute right-0 bottom-full mb-2 w-72 bg-theme-card border border-theme-border rounded-2xl p-3.5 shadow-2xl z-30 animate-fade-up text-theme-primary backdrop-blur-xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between pb-2 border-b border-theme-border mb-2.5">
      <div class="flex items-center gap-1.5 text-xs font-bold text-forest dark:text-forest-glow">
        <IconCalendarDate :size="14" />
        <span>Pilih Durasi Sewa Nyata</span>
      </div>
      <button
        @click.stop="emit('close')"
        class="text-stone-400 hover:text-theme-primary p-0.5 rounded-md cursor-pointer"
        aria-label="Tutup"
      >
        <IconClose :size="13" />
      </button>
    </div>

    <!-- Quick Preset Buttons -->
    <div v-if="!isCustomMode" class="space-y-1.5">
      <button
        @click.stop="handlePreset(1)"
        class="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold bg-stone-50 dark:bg-stone-900 hover:bg-forest/15 dark:hover:bg-forest/25 hover:text-forest dark:hover:text-forest-glow border border-theme-border transition cursor-pointer text-left"
      >
        <div>
          <p class="text-xs font-bold">1 Hari (Besok)</p>
          <p class="text-[10px] text-stone-500 font-normal">Sewa harian kilat</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-theme-border font-bold">
          1x tarif
        </span>
      </button>

      <button
        @click.stop="handlePreset(3)"
        class="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold bg-forest/10 dark:bg-forest/20 text-forest dark:text-forest-glow border border-forest/30 transition cursor-pointer text-left"
      >
        <div>
          <p class="text-xs font-black">3 Hari (Weekend / Project)</p>
          <p class="text-[10px] opacity-80 font-normal">Paling populer</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 bg-forest text-white rounded-md font-bold">
          3x tarif
        </span>
      </button>

      <button
        @click.stop="handlePreset(7)"
        class="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold bg-stone-50 dark:bg-stone-900 hover:bg-forest/15 dark:hover:bg-forest/25 hover:text-forest dark:hover:text-forest-glow border border-theme-border transition cursor-pointer text-left"
      >
        <div>
          <p class="text-xs font-bold">1 Minggu (7 Hari)</p>
          <p class="text-[10px] text-stone-500 font-normal">Liburan & Produksi</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-theme-border font-bold">
          7x tarif
        </span>
      </button>

      <button
        @click.stop="isCustomMode = true"
        class="w-full text-center py-1 text-[11px] text-forest dark:text-forest-glow font-bold hover:underline cursor-pointer pt-1.5"
      >
        + Pilih Tanggal Spesifik Sendiri
      </button>
    </div>

    <!-- Custom Date Mode -->
    <div v-else class="space-y-2.5">
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Mulai Sewa</label>
        <input
          v-model="customStart"
          type="date"
          :min="formatDateToISO(new Date())"
          class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none focus:border-forest"
        />
      </div>

      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Pengembalian</label>
        <input
          v-model="customEnd"
          type="date"
          :min="customStart"
          class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none focus:border-forest"
        />
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button
          @click.stop="isCustomMode = false"
          class="flex-1 py-1.5 text-xs font-bold text-stone-500 hover:text-theme-primary border border-theme-border rounded-xl cursor-pointer"
        >
          Kembali
        </button>
        <button
          @click.stop="handleCustomSubmit"
          class="flex-1 py-1.5 text-xs font-black bg-forest hover:bg-forest-hover text-white rounded-xl shadow-sm cursor-pointer"
        >
          Terapkan
        </button>
      </div>
    </div>
  </div>
</template>
