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
    class="shrink-0 inline-block"
    aria-hidden="true"
  >
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="3 10 12 4 21 10" />
    <line x1="6" y1="14" x2="6" y2="18" />
    <line x1="10" y1="14" x2="10" y2="18" />
    <line x1="14" y1="14" x2="14" y2="18" />
    <line x1="18" y1="14" x2="18" y2="18" />
  </svg>
</template>
