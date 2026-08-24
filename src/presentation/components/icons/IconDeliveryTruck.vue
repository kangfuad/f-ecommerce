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
    <!-- Pickup & Express Delivery Van -->
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M14 8h4.5a2 2 0 0 1 1.6.8l2.5 3.3a2 2 0 0 1 .4 1.2V17a1 1 0 0 1-1 1h-2" />
    <circle cx="7" cy="18" r="2.5" />
    <circle cx="17" cy="18" r="2.5" />
  </svg>
</template>
