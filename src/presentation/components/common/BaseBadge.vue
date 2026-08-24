<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'coral' | 'accent' | 'success' | 'blue' | 'dark' | 'muted'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wider',
      size === 'sm' ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3 py-1.5',
      variant === 'primary' && 'bg-sage/15 dark:bg-emerald-950/60 text-sage-hover dark:text-sage-soft border border-sage/30 dark:border-sage-soft/30',
      variant === 'blue' && 'bg-dusty-blue/15 dark:bg-blue-950/60 text-dusty-blue border border-dusty-blue/30',
      variant === 'coral' && 'bg-coral/15 dark:bg-rose-950/60 text-coral border border-coral/30',
      variant === 'accent' && 'bg-amber-500/15 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-500/30',
      variant === 'success' && 'bg-emerald-500/15 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30',
      variant === 'dark' && 'bg-slate-800 dark:bg-zinc-800 text-white dark:text-ash-gray border border-slate-700 dark:border-zinc-700',
      variant === 'muted' && 'bg-slate-100 dark:bg-zinc-800/70 text-theme-muted border border-theme-border',
    ]"
  >
    <slot />
  </span>
</template>
