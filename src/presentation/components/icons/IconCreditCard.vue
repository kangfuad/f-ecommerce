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
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
</template>
