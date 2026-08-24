<script setup lang="ts">
interface Props {
  size?: number | string
  strokeWidth?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 22,
  strokeWidth: 2,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Coin with Refresh/Return Loop -->
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9h-4a2 2 0 1 0 0 4h3a2 2 0 1 1 0 4h-4" />
    <line x1="12" y1="7" x2="12" y2="17" />
  </svg>
</template>
