<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { IconChevronDown, IconCheck, IconLocation, IconClose, IconSearch } from '@/presentation/components/icons'

export interface SelectOption {
  value: string
  label: string
  subtitle?: string
  badge?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options?: SelectOption[] | string[]
    placeholder?: string
    searchPlaceholder?: string
    label?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    options: () => [],
    placeholder: 'Pilih opsi...',
    searchPlaceholder: 'Ketik untuk mencari...',
    required: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Watch isOpen to automatically focus search input when opened
watch(isOpen, async (val) => {
  if (val) {
    searchQuery.value = ''
    await nextTick()
    searchInputRef.value?.focus()
  }
})

// Normalize options to SelectOption format
const normalizedOptions = computed<SelectOption[]>(() => {
  if (!props.options || !Array.isArray(props.options)) return []
  return props.options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })
})

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return normalizedOptions.value
  return normalizedOptions.value.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
  )
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find((opt) => opt.value === props.modelValue)
})

function selectOption(opt: SelectOption) {
  emit('update:modelValue', opt.value)
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative space-y-1 text-xs" ref="containerRef">
    <label v-if="label" class="font-bold block text-theme-primary">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>

    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :disabled="disabled"
      :class="[
        'w-full bg-stone-50 dark:bg-stone-900 border rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between gap-2 transition cursor-pointer',
        isOpen ? 'border-forest ring-1 ring-forest' : 'border-theme-border hover:border-forest/40',
        disabled && 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-800'
      ]"
    >
      <div class="flex items-center gap-2 min-w-0">
        <IconLocation :size="14" class="text-forest dark:text-forest-glow shrink-0" />
        <span v-if="selectedOption" class="font-bold text-theme-primary truncate">
          {{ selectedOption.label }}
          <span v-if="selectedOption.subtitle" class="text-stone-400 font-normal ml-1 text-[11px]">
            ({{ selectedOption.subtitle }})
          </span>
        </span>
        <span v-else class="text-stone-400 font-normal">
          {{ placeholder }}
        </span>
      </div>

      <IconChevronDown
        :size="14"
        :class="['text-stone-400 transition-transform duration-200 shrink-0', isOpen && 'rotate-180 text-forest']"
      />
    </button>

    <!-- Dropdown Panel Popover -->
    <div
      v-if="isOpen"
      class="absolute left-0 top-full mt-1.5 w-full bg-theme-card border border-theme-border rounded-2xl shadow-2xl z-50 p-2.5 space-y-2 animate-fade-up max-h-72 flex flex-col backdrop-blur-xl"
    >
      <!-- Search Input inside Popover -->
      <div class="relative flex items-center shrink-0">
        <IconSearch :size="13" class="absolute left-2.5 text-stone-400 pointer-events-none" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          @keydown.esc="isOpen = false"
          class="w-full bg-stone-100 dark:bg-stone-800/90 border border-theme-border rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-theme-primary focus:outline-none focus:ring-1 focus:ring-forest"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''; searchInputRef?.focus()"
          class="absolute right-2.5 text-stone-400 hover:text-theme-primary p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
        >
          <IconClose :size="12" />
        </button>
      </div>

      <!-- Options List -->
      <div class="overflow-y-auto custom-scrollbar flex-1 space-y-1 pr-1 max-h-48">
        <div
          v-if="filteredOptions.length === 0"
          class="text-center py-4 text-xs text-stone-500 font-medium"
        >
          Tidak ada hasil untuk "{{ searchQuery }}"
        </div>

        <button
          v-for="opt in filteredOptions"
          :key="opt.value"
          type="button"
          @click="selectOption(opt)"
          :class="[
            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer',
            opt.value === modelValue
              ? 'bg-forest/15 text-forest dark:text-forest-glow font-bold'
              : 'text-theme-primary hover:bg-stone-100 dark:hover:bg-stone-800'
          ]"
        >
          <div class="min-w-0 pr-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold">{{ opt.label }}</span>
              <span
                v-if="opt.badge"
                class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              >
                {{ opt.badge }}
              </span>
            </div>
            <p v-if="opt.subtitle" class="text-[10px] text-stone-400 font-normal truncate">
              {{ opt.subtitle }}
            </p>
          </div>

          <IconCheck v-if="opt.value === modelValue" :size="14" class="text-forest dark:text-forest-glow shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>
