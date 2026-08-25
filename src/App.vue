<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useAuth } from '@/presentation/composables/useAuth'
import { useTheme } from '@/presentation/composables/useTheme'
import { usePwa } from '@/presentation/composables/usePwa'
import AppToast from '@/presentation/components/common/AppToast.vue'
import AuthModal from '@/presentation/components/auth/AuthModal.vue'
import ImageLightboxModal from '@/presentation/components/common/ImageLightboxModal.vue'
import WishlistDrawer from '@/presentation/components/wishlist/WishlistDrawer.vue'
import CartDrawer from '@/presentation/components/cart/CartDrawer.vue'
import FloatingThemeToggle from '@/presentation/components/common/FloatingThemeToggle.vue'
import PwaInstallPrompt from '@/presentation/components/common/PwaInstallPrompt.vue'
import PwaOfflineBanner from '@/presentation/components/common/PwaOfflineBanner.vue'

const route = useRoute()
const { isLoggedIn, openLoginModal, openRegisterModal, initAuth } = useAuth()
const { initTheme } = useTheme()
const { initPwa } = usePwa()

function checkAuthUrlQuery() {
  if (!isLoggedIn.value) {
    if (route.query.auth === 'login') {
      openLoginModal()
    } else if (route.query.auth === 'register') {
      openRegisterModal()
    }
  }
}

onMounted(() => {
  initTheme()
  initAuth()
  initPwa()
  checkAuthUrlQuery()
})

watch(
  () => [route.query.auth, isLoggedIn.value],
  () => {
    checkAuthUrlQuery()
  }
)
</script>

<template>
  <PwaOfflineBanner />
  <RouterView />
  <FloatingThemeToggle />
  <PwaInstallPrompt />
  <AppToast />
  <AuthModal />
  <ImageLightboxModal />
  <WishlistDrawer />
  <CartDrawer />
</template>
