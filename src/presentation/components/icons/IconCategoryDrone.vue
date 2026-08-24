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
    <!-- Drone Quadcopter Body with Soundwave Wings -->
    <rect x="9" y="9" width="6" height="6" rx="2" fill="currentColor" fill-opacity="0.1" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <line x1="9" y1="9" x2="4" y2="4" />
    <line x1="15" y1="9" x2="20" y2="4" />
    <line x1="9" y1="15" x2="4" y2="20" />
    <line x1="15" y1="15" x2="20" y2="20" />
    <!-- Rotor Propellers -->
    <circle cx="4" cy="4" r="2.5" />
    <circle cx="20" cy="4" r="2.5" />
    <circle cx="4" cy="20" r="2.5" />
    <circle cx="20" cy="20" r="2.5" />
  </svg>
</template>
