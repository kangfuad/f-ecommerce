import { ref } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'eps_color_theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function getStoredPreference(): ThemePreference {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(THEME_STORAGE_KEY)
      if (!raw) return 'system'
      let pref = raw
      if (raw.indexOf('"') === 0 || raw.indexOf("'") === 0) {
        try { pref = JSON.parse(raw) } catch {}
      }
      if (pref === 'light' || pref === 'dark' || pref === 'system') {
        return pref
      }
    }
  } catch {}
  return 'system'
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

// Module-level persistent singleton state
const initialPreference = getStoredPreference()
const currentPreference = ref<ThemePreference>(initialPreference)
const resolvedTheme = ref<ResolvedTheme>(
  initialPreference === 'system' ? getSystemTheme() : initialPreference
)
let isListenerAttached = false

// Synchronize DOM immediately upon module import
updateDOMTheme(resolvedTheme.value)

export function useTheme() {
  function applyTheme(preference: ThemePreference) {
    currentPreference.value = preference
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, preference)
      }
    } catch {}

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
    const saved = getStoredPreference()
    applyTheme(saved)

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
