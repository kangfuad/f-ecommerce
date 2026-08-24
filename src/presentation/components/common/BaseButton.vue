<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'coral'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-page',
      disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95',
      size === 'sm' && 'px-4 py-2 text-xs gap-1.5',
      size === 'md' && 'px-6 py-3 text-sm gap-2',
      size === 'lg' && 'px-8 py-4 text-base gap-2.5',
      variant === 'primary' && 'bg-theme-cta hover:bg-theme-cta-hover text-theme-cta-text shadow-glow-sage focus:ring-sage',
      variant === 'coral' && 'bg-coral hover:bg-coral-hover text-white shadow-sm focus:ring-coral',
      variant === 'secondary' && 'bg-theme-card hover:bg-theme-card-hover text-theme-primary border border-theme-border focus:ring-theme-border',
      variant === 'outline' && 'border border-theme-border hover:border-slate-400 dark:hover:border-zinc-500 text-theme-primary bg-transparent hover:bg-theme-card-hover',
      variant === 'ghost' && 'text-theme-muted hover:text-theme-primary hover:bg-theme-card-hover',
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
