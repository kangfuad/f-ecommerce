import { ref } from 'vue'

const PWA_DISMISS_KEY = 'eps_pwa_dismissed_until'
const PWA_INSTALLED_KEY = 'eps_pwa_installed'
const DISMISS_COOLDOWN_DAYS = 7

const isInstallable = ref(false)
const isInstalled = ref(false)
const isIos = ref(false)
const isIosSafari = ref(false)
const showIosGuide = ref(false)
const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false)
const isInstallBannerDismissed = ref(false)
const deferredPrompt = ref<any>(null)
let isInitialized = false

export function usePwa() {
  function checkDisplayMode() {
    if (typeof window === 'undefined') return
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    if (isStandalone) {
      isInstalled.value = true
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, 'true')
      } catch {}
    } else {
      try {
        if (localStorage.getItem(PWA_INSTALLED_KEY) === 'true') {
          isInstalled.value = true
        }
      } catch {}
    }
  }

  function detectIos() {
    if (typeof window === 'undefined') return
    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|edgios|opios/.test(ua)

    isIos.value = isIosDevice
    isIosSafari.value = isIosDevice && isSafari

    // On iOS Safari, beforeinstallprompt is not supported by Apple, so we activate installable status directly
    if (isIosDevice && !isInstalled.value && !checkDismissedState()) {
      setTimeout(() => {
        if (!isInstalled.value && !checkDismissedState()) {
          isInstallable.value = true
        }
      }, 3500)
    }
  }

  function checkDismissedState(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const until = localStorage.getItem(PWA_DISMISS_KEY)
        if (until) {
          const expireTime = Number(until)
          if (!isNaN(expireTime) && Date.now() < expireTime) {
            return true
          }
        }
      }
    } catch {}
    return false
  }

  function initPwa() {
    if (typeof window === 'undefined' || isInitialized) return
    isInitialized = true

    checkDisplayMode()
    detectIos()

    // Check if user previously dismissed the prompt (7-day cooldown)
    if (checkDismissedState()) {
      isInstallBannerDismissed.value = true
    }

    // Listen for beforeinstallprompt (Chrome / Android / Edge / Desktop)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e

      // Delay prompt appearance by 3.5 seconds so it doesn't block the user immediately
      setTimeout(() => {
        if (!isInstalled.value && !checkDismissedState()) {
          isInstallable.value = true
        }
      }, 3500)
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt.value = null
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, 'true')
      } catch {}
      console.log('[PWA] e-punyasewa app was successfully installed.')
    })

    // Online & Offline status listeners
    window.addEventListener('online', () => {
      isOffline.value = false
    })

    window.addEventListener('offline', () => {
      isOffline.value = true
    })
  }

  async function installApp(): Promise<boolean> {
    if (isIosSafari.value || isIos.value) {
      showIosGuide.value = !showIosGuide.value
      return true
    }

    if (!deferredPrompt.value) return false

    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        try {
          localStorage.setItem(PWA_INSTALLED_KEY, 'true')
        } catch {}
        return true
      }
    } catch (e) {
      console.warn('[PWA] Installation prompt error:', e)
    }
    return false
  }

  function dismissInstallPrompt() {
    isInstallBannerDismissed.value = true
    isInstallable.value = false
    showIosGuide.value = false
    try {
      // Set 7-day cooldown in localStorage so user is not repeatedly prompted
      const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(PWA_DISMISS_KEY, String(Date.now() + cooldownMs))
    } catch {}
  }

  return {
    isInstallable,
    isInstalled,
    isIos,
    isIosSafari,
    showIosGuide,
    isOffline,
    isInstallBannerDismissed,
    initPwa,
    installApp,
    dismissInstallPrompt,
  }
}
