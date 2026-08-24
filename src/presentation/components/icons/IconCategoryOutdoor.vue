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
    <!-- Alpine Mountain Tent with Center Pole -->
    <path d="M19 20 12 4 5 20" />
    <path d="m12 4 7 16H5L12 4z" fill="currentColor" fill-opacity="0.08" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <path d="M9 20l3-6 3 6" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
</template>
