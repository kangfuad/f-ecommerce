import { ref } from 'vue'
import { LocalStorageAdapter } from '@/infrastructure/storage/LocalStorageAdapter'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'eps_color_theme'
const currentPreference = ref<ThemePreference>('system')
const resolvedTheme = ref<ResolvedTheme>('light')
let isListenerAttached = false

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function updateDOMTheme(theme: ResolvedTheme) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function useTheme() {
  function applyTheme(preference: ThemePreference) {
    currentPreference.value = preference
    LocalStorageAdapter.setItem(THEME_STORAGE_KEY, preference)

    const effective = preference === 'system' ? getSystemTheme() : preference
    resolvedTheme.value = effective
    updateDOMTheme(effective)
  }

  function cycleTheme() {
    // Cycles: system -> light -> dark -> system
    if (currentPreference.value === 'system') {
      applyTheme('light')
    } else if (currentPreference.value === 'light') {
      applyTheme('dark')
    } else {
      applyTheme('system')
    }
  }

  function setSystemTheme() {
    applyTheme('system')
  }

  function setLightTheme() {
    applyTheme('light')
  }

  function setDarkTheme() {
    applyTheme('dark')
  }

  function initTheme() {
    const saved = LocalStorageAdapter.getItem<ThemePreference | null>(THEME_STORAGE_KEY, null)
    
    // Use saved preference, or default to 'system'
    const initialPreference: ThemePreference = saved === 'light' || saved === 'dark' || saved === 'system' 
      ? saved 
      : 'system'
      
    applyTheme(initialPreference)

    // Listen for OS/System theme changes in real-time
    if (typeof window !== 'undefined' && window.matchMedia && !isListenerAttached) {
      isListenerAttached = true
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (currentPreference.value === 'system') {
          const newTheme: ResolvedTheme = e.matches ? 'dark' : 'light'
          resolvedTheme.value = newTheme
          updateDOMTheme(newTheme)
        }
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(handleChange)
      }
    }
  }

  return {
    currentPreference,
    currentTheme: resolvedTheme, // reactive 'light' | 'dark' for components
    resolvedTheme,
    isDark: () => resolvedTheme.value === 'dark',
    cycleTheme,
    toggleTheme: cycleTheme,
    applyTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
    initTheme,
  }
}
