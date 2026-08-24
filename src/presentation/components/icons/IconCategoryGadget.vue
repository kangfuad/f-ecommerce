<script setup lang="ts">
interface Props {
  size?: number | string
  strokeWidth?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 20,
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
    <!-- Ultra-slim Laptop & Gadget -->
    <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" fill-opacity="0.08" />
    <path d="M2 20h20" />
    <path d="M7 16h10" />
    <circle cx="12" cy="7" r="0.75" fill="currentColor" />
  </svg>
</template>
