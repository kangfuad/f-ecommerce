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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
    <line x1="17" y1="7" x2="17.01" y2="7" />
    <line x1="7" y1="17" x2="7.01" y2="17" />
    <line x1="17" y1="17" x2="17.01" y2="17" />
  </svg>
</template>
