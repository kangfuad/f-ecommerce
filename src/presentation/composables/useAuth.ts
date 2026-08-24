import { shallowRef, ref, computed } from 'vue'
import { UserProfile } from '@/domain/entities/UserProfile'
import { AuthService } from '@/infrastructure/services/api'

const AUTH_STORAGE_KEY = 'epunyasewa_auth_user'
const AUTH_TOKEN_KEY = 'epunyasewa_auth_token'

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

  async function login(emailOrPhone: string, password?: string): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      if (!emailOrPhone.trim()) {
        throw new Error('Silakan masukkan email atau nomor WhatsApp Anda.')
      }

      // Hit AuthService hitting /data/auth-user.json
      const response = await AuthService.loginWithCredentials(emailOrPhone.trim(), password)
      
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        const loggedUser = new UserProfile({
          id: user.id || `user_${Date.now()}`,
          fullName: user.fullName || emailOrPhone,
          email: user.email || emailOrPhone,
          phone: user.phone || '081234567890',
          isKycVerified: user.isKycVerified ?? true,
          memberTier: 'VERIFIED_GOLD',
          rentalCount: 1,
          joinedAt: new Date(),
        })

        currentUser.value = loggedUser
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser))
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        closeAuthModal()
      } else {
        throw new Error(response.message || 'Gagal masuk akun.')
      }
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
      const response = await AuthService.loginWithCredentials('auri.fuad@example.com')
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        const demoUser = new UserProfile({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isKycVerified: true,
          memberTier: 'VERIFIED_GOLD',
          rentalCount: 5,
          joinedAt: new Date('2026-01-15'),
        })

        currentUser.value = demoUser
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser))
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        closeAuthModal()
      }
    } catch (err: any) {
      authError.value = err.message || 'Gagal masuk demo.'
    } finally {
      isLoading.value = false
    }
  }

  async function register(fullName: string, email: string, phone: string, password?: string): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        throw new Error('Semua data pendaftaran wajib diisi.')
      }

      const response = await AuthService.loginWithCredentials(email.trim(), password)
      if (response.status === 'success' && response.data) {
        const newUser = new UserProfile({
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          isKycVerified: true,
          memberTier: 'VERIFIED_GOLD',
          rentalCount: 0,
          joinedAt: new Date(),
        })

        currentUser.value = newUser
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token)
        closeAuthModal()
      }
    } catch (err: any) {
      authError.value = err.message || 'Gagal mendaftar. Silakan coba kembali.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      const response = await AuthService.loginWithGoogle()
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        const googleUser = new UserProfile({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isKycVerified: true,
          memberTier: 'VERIFIED_GOLD',
          rentalCount: 2,
          joinedAt: new Date(),
        })

        currentUser.value = googleUser
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser))
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        closeAuthModal()
      }
    } catch (err: any) {
      authError.value = err.message || 'Gagal masuk dengan Google SSO.'
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithApple(): Promise<void> {
    isLoading.value = true
    authError.value = null

    try {
      const response = await AuthService.loginWithApple()
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        const appleUser = new UserProfile({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isKycVerified: true,
          memberTier: 'VERIFIED_GOLD',
          rentalCount: 1,
          joinedAt: new Date(),
        })

        currentUser.value = appleUser
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appleUser))
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        closeAuthModal()
      }
    } catch (err: any) {
      authError.value = err.message || 'Gagal masuk dengan Apple ID.'
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_KEY)
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
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
  }
}
