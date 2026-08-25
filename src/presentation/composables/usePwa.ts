import { ref, onMounted } from 'vue'

const isInstallable = ref(false)
const isInstalled = ref(false)
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

    isInstalled.value = isStandalone
  }

  function initPwa() {
    if (typeof window === 'undefined' || isInitialized) return
    isInitialized = true

    checkDisplayMode()

    // Listen for beforeinstallprompt (Chrome / Android / Edge / Desktop)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e
      isInstallable.value = true
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt.value = null
      console.log('[PWA] e-punyasewa app was successfully installed.')
    })

    // Online & Offline status listeners
    window.addEventListener('online', () => {
      isOffline.value = false
    })

    window.addEventListener('offline', () => {
      isOffline.value = true
    })

    // Check session dismissed state
    try {
      if (sessionStorage.getItem('eps_pwa_dismissed') === 'true') {
        isInstallBannerDismissed.value = true
      }
    } catch {}
  }

  async function installApp(): Promise<boolean> {
    if (!deferredPrompt.value) return false

    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        return true
      }
    } catch (e) {
      console.warn('[PWA] Installation prompt error:', e)
    }
    return false
  }

  function dismissInstallPrompt() {
    isInstallBannerDismissed.value = true
    try {
      sessionStorage.setItem('eps_pwa_dismissed', 'true')
    } catch {}
  }

  return {
    isInstallable,
    isInstalled,
    isOffline,
    isInstallBannerDismissed,
    initPwa,
    installApp,
    dismissInstallPrompt,
  }
}
