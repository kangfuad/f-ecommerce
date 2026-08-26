<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/presentation/composables/useAuth'
import { useBodyScrollLock } from '@/presentation/composables/useBodyScrollLock'
import BaseButton from '../common/BaseButton.vue'
import {
  IconClose,
  IconShieldCheck,
  IconCheck,
  IconLogo,
  IconGoogle,
  IconApple,
} from '@/presentation/components/icons'

const route = useRoute()
const router = useRouter()

const {
  isAuthModalOpen,
  authModalTab,
  isLoading,
  authError,
  closeAuthModal,
  login,
  loginWithGoogle,
  loginWithApple,
  register,
} = useAuth()

useBodyScrollLock(isAuthModalOpen)

// Form states
const loginIdentifier = ref('')
const loginPassword = ref('')

const regFullName = ref('')
const regEmail = ref('')
const regPhone = ref('')
const regPassword = ref('')

function checkRedirectAfterAuth() {
  const target = (route.query.redirect as string) || ''
  if (target && target.startsWith('/')) {
    router.replace(target).catch(() => {})
  } else if (route.query.auth) {
    const cleanQuery = { ...route.query }
    delete cleanQuery.auth
    delete cleanQuery.redirect
    router.replace({ query: cleanQuery }).catch(() => {})
  }
}

async function handleLoginSubmit() {
  await login(loginIdentifier.value, loginPassword.value)
  checkRedirectAfterAuth()
}

async function handleGoogleSSO() {
  await loginWithGoogle()
  checkRedirectAfterAuth()
}

const regConfirmPassword = ref('')

async function handleAppleSSO() {
  await loginWithApple()
  checkRedirectAfterAuth()
}

async function handleRegisterSubmit() {
  if (regPassword.value.length < 8) {
    authError.value = 'Kata sandi minimal 8 karakter.'
    return
  }
  if (regPassword.value !== regConfirmPassword.value) {
    authError.value = 'Konfirmasi kata sandi tidak sesuai dengan kata sandi yang dibuat.'
    return
  }
  await register(regFullName.value, regEmail.value, regPhone.value, regPassword.value)
  checkRedirectAfterAuth()
}
</script>

<template>
  <div v-if="isAuthModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <div
      @click="closeAuthModal"
      class="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md transition-opacity"
    ></div>

    <!-- Modal Card -->
    <div class="relative bg-theme-card rounded-3xl max-w-md w-full shadow-2xl border border-theme-border z-10 animate-fade-up text-theme-primary overflow-hidden my-auto">
      <!-- Close Button -->
      <button
        @click="closeAuthModal"
        class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-theme-border flex items-center justify-center text-stone-500 hover:text-theme-primary transition cursor-pointer"
        aria-label="Tutup"
      >
        <IconClose :size="15" />
      </button>

      <!-- Modal Header with Logo & Tabs -->
      <div class="p-6 sm:p-7 pb-0 border-b border-theme-border">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-8 h-8 rounded-xl bg-[#244E33] dark:bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <IconLogo :size="18" />
          </div>
          <div>
            <h2 class="font-extrabold text-base tracking-tight text-theme-primary">
              Akun e-punya<span class="text-forest dark:text-forest-glow">sewa</span>
            </h2>
            <p class="text-[11px] text-stone-500">Platform Persewaan Perlengkapan Premium</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-theme-border gap-6">
          <button
            @click="authModalTab = 'login'"
            :class="[
              'pb-3 text-xs font-black uppercase tracking-wider transition cursor-pointer relative',
              authModalTab === 'login'
                ? 'text-forest dark:text-forest-glow border-b-2 border-forest dark:border-forest-glow'
                : 'text-stone-400 hover:text-theme-primary',
            ]"
          >
            Masuk Akun
          </button>
          <button
            @click="authModalTab = 'register'"
            :class="[
              'pb-3 text-xs font-black uppercase tracking-wider transition cursor-pointer relative',
              authModalTab === 'register'
                ? 'text-forest dark:text-forest-glow border-b-2 border-forest dark:border-forest-glow'
                : 'text-stone-400 hover:text-theme-primary',
            ]"
          >
            Daftar Member
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6 sm:p-7 space-y-4">
        <!-- Error Alert -->
        <div
          v-if="authError"
          class="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/60"
        >
          {{ authError }}
        </div>

        <!-- TAB 1: LOGIN -->
        <form v-if="authModalTab === 'login'" @submit.prevent="handleLoginSubmit" class="space-y-3.5">
          <div>
            <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">
              Email atau No. WhatsApp
            </label>
            <input
              v-model="loginIdentifier"
              type="text"
              required
              placeholder="contoh: fuad@gmail.com atau 0812..."
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-forest transition"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-bold text-stone-600 dark:text-stone-400">Kata Sandi</label>
              <button type="button" class="text-[11px] text-forest dark:text-forest-glow hover:underline cursor-pointer">
                Lupa Sandi?
              </button>
            </div>
            <input
              v-model="loginPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-forest transition"
            />
          </div>

          <BaseButton
            type="submit"
            :loading="isLoading"
            variant="primary"
            size="md"
            class="w-full mt-2"
          >
            Masuk ke Akun
          </BaseButton>

          <!-- Divider -->
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-theme-border"></div>
            <span class="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              atau masuk dengan
            </span>
            <div class="flex-grow border-t border-theme-border"></div>
          </div>

          <!-- Single Sign-On (SSO) Buttons Below Form -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Google SSO -->
            <button
              type="button"
              @click="handleGoogleSSO"
              :disabled="isLoading"
              class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <IconGoogle :size="16" class="shrink-0" />
              <span>Google</span>
            </button>

            <!-- Apple SSO -->
            <button
              type="button"
              @click="handleAppleSSO"
              :disabled="isLoading"
              class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-stone-900 dark:border-stone-700 bg-stone-950 hover:bg-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <IconApple :size="16" class="shrink-0" />
              <span>Apple ID</span>
            </button>
          </div>


        </form>

        <!-- TAB 2: REGISTER -->
        <form v-else @submit.prevent="handleRegisterSubmit" class="space-y-3">
          <!-- Member Benefit Badge -->
          <div class="bg-forest/10 dark:bg-forest/20 border border-forest/30 rounded-2xl p-3 flex items-start gap-2.5">
            <IconShieldCheck :size="18" class="text-forest dark:text-forest-glow shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-extrabold text-forest dark:text-forest-glow">Platform Sewa Terpercaya</p>
              <p class="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                Daftar akun untuk kemudahan booking unit, jadwal temu, dan transaksi langsung yang transparan.
              </p>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Nama Lengkap Sesuai KTP</label>
            <input
              v-model="regFullName"
              type="text"
              required
              placeholder="contoh: Ahmad Fuad"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2 text-xs text-theme-primary focus:outline-none focus:border-forest transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Email</label>
              <input
                v-model="regEmail"
                type="email"
                required
                placeholder="nama@email.com"
                class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-forest transition"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">No. WhatsApp</label>
              <input
                v-model="regPhone"
                type="tel"
                required
                placeholder="08123456789"
                class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-forest transition"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Buat Kata Sandi</label>
            <input
              v-model="regPassword"
              type="password"
              required
              minlength="8"
              placeholder="Minimal 8 karakter"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2 text-xs text-theme-primary focus:outline-none focus:border-forest transition"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-bold text-stone-600 dark:text-stone-400">Konfirmasi Kata Sandi</label>
              <span v-if="regPassword && regConfirmPassword" :class="regPassword === regConfirmPassword ? 'text-emerald-500' : 'text-red-500'" class="text-[10px] font-bold">
                {{ regPassword === regConfirmPassword ? '✓ Sandi Cocok' : '✗ Belum Cocok' }}
              </span>
            </div>
            <input
              v-model="regConfirmPassword"
              type="password"
              required
              minlength="8"
              placeholder="Ulangi kata sandi di atas"
              class="w-full bg-stone-50 dark:bg-stone-900 border border-theme-border rounded-xl px-3.5 py-2 text-xs text-theme-primary focus:outline-none focus:border-forest transition"
            />
          </div>

          <BaseButton
            type="submit"
            :loading="isLoading"
            variant="primary"
            size="md"
            class="w-full mt-2"
          >
            Daftar Akun Baru
          </BaseButton>

          <!-- Divider -->
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-theme-border"></div>
            <span class="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              atau daftar cepat dengan
            </span>
            <div class="flex-grow border-t border-theme-border"></div>
          </div>

          <!-- Single Sign-On (SSO) Buttons Below Form -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Google SSO -->
            <button
              type="button"
              @click="handleGoogleSSO"
              :disabled="isLoading"
              class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <IconGoogle :size="16" class="shrink-0" />
              <span>Google</span>
            </button>

            <!-- Apple SSO -->
            <button
              type="button"
              @click="handleAppleSSO"
              :disabled="isLoading"
              class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-stone-900 dark:border-stone-700 bg-stone-950 hover:bg-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <IconApple :size="16" class="shrink-0" />
              <span>Apple ID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
