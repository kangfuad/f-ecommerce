import { shallowRef, ref, computed } from 'vue'
import { UserProfile } from '@/domain/entities/UserProfile'

const AUTH_STORAGE_KEY = 'epunyasewa_auth_user'

// Sample Demo Verified User
const DEMO_VERIFIED_USER = new UserProfile({
  id: 'user_fuad_01',
  fullName: 'Fuad Auri',
  email: 'fuad.auri@epunyasewa.id',
  phone: '081234567890',
  isKycVerified: true,
  memberTier: 'VERIFIED_GOLD',
  rentalCount: 5,
  joinedAt: new Date('2026-01-15'),
})

// Global reactive states
const currentUser = shallowRef<UserProfile | null>(null)
const isAuthModalOpen = ref(false)
const authModalTab = ref<'login' | 'register'>('login')
const isLoading = ref(false)
const authError = ref<string | null>(null)
const isInitialized = ref(false)

export function useAuth() {
  function initAuth() {
    if (isInitialized.value) return
    isInitialized.value = true

    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        currentUser.value = new UserProfile({
          ...parsed,
          joinedAt: new Date(parsed.joinedAt),
        })
      }
    } catch {
      currentUser.value = null
    }
  }

  const isLoggedIn = computed(() => !!currentUser.value)

  function openLoginModal() {
    authModalTab.value = 'login'
    authError.value = null
    isAuthModalOpen.value = true
  }

  function openRegisterModal() {
    authModalTab.value = 'register'
    authError.value = null
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
    authError.value = null
  }

  async function login(emailOrPhone: string, _password?: string): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      if (!emailOrPhone.trim()) {
        throw new Error('Silakan masukkan email atau nomor WhatsApp Anda.')
      }

      // Login as verified user
      const loggedUser = new UserProfile({
        id: `user_${Date.now()}`,
        fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Member Terverifikasi',
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@epunyasewa.id`,
        phone: emailOrPhone.includes('@') ? '081234567890' : emailOrPhone,
        isKycVerified: true,
        memberTier: 'VERIFIED_GOLD',
        rentalCount: 1,
        joinedAt: new Date(),
      })

      currentUser.value = loggedUser
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser))
      closeAuthModal()
    } catch (err: any) {
      authError.value = err.message || 'Gagal masuk akun. Periksa kembali kredensial Anda.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loginAsDemo(): Promise<void> {
    isLoading.value = true
    authError.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      currentUser.value = DEMO_VERIFIED_USER
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_VERIFIED_USER))
      closeAuthModal()
    } finally {
      isLoading.value = false
    }
  }

  async function register(fullName: string, email: string, phone: string, _password?: string): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 700))

      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        throw new Error('Semua data pendaftaran wajib diisi.')
      }

      const newUser = new UserProfile({
        id: `user_${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        isKycVerified: true, // Auto-verified KYC for trial
        memberTier: 'VERIFIED_GOLD',
        rentalCount: 0,
        joinedAt: new Date(),
      })

      currentUser.value = newUser
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      closeAuthModal()
    } catch (err: any) {
      authError.value = err.message || 'Gagal mendaftar. Silakan coba kembali.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return {
    currentUser,
    isLoggedIn,
    isAuthModalOpen,
    authModalTab,
    isLoading,
    authError,
    initAuth,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    login,
    loginAsDemo,
    register,
    logout,
  }
}
