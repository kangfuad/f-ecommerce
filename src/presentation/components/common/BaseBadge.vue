<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'coral' | 'terracotta' | 'accent' | 'success' | 'blue' | 'dark' | 'muted' | 'white'
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
      'inline-flex items-center gap-1.5 font-black rounded-full uppercase tracking-wider shadow-sm transition-colors',
      size === 'sm' ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3.5 py-1.5',
      variant === 'primary' && 'bg-forest/25 dark:bg-forest/40 text-[#2D5239] dark:text-[#A3C4AF] border border-[#2D5239]/30 dark:border-[#82A78F]/50',
      (variant === 'coral' || variant === 'terracotta') && 'bg-terracotta/20 dark:bg-terracotta/30 text-terracotta dark:text-terracotta-soft border border-terracotta/40 dark:border-terracotta-soft/50',
      variant === 'blue' && 'bg-forest/25 dark:bg-forest/40 text-[#2D5239] dark:text-[#A3C4AF] border border-[#2D5239]/30 dark:border-[#82A78F]/50',
      variant === 'accent' && 'bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40',
      variant === 'success' && 'bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40',
      variant === 'dark' && 'bg-stone-800 text-stone-100 border border-stone-700',
      variant === 'muted' && 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700',
      variant === 'white' && 'bg-white text-stone-900 border border-stone-300 shadow-md',
    ]"
  >
    <slot />
  </span>
</template>
