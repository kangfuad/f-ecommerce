<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useAuth } from '@/presentation/composables/useAuth'
import AppToast from '@/presentation/components/common/AppToast.vue'
import AuthModal from '@/presentation/components/auth/AuthModal.vue'
import ImageLightboxModal from '@/presentation/components/common/ImageLightboxModal.vue'
import WishlistDrawer from '@/presentation/components/wishlist/WishlistDrawer.vue'
import CartDrawer from '@/presentation/components/cart/CartDrawer.vue'
import FloatingThemeToggle from '@/presentation/components/common/FloatingThemeToggle.vue'

const route = useRoute()
const { isLoggedIn, openLoginModal, openRegisterModal, initAuth } = useAuth()

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
  initAuth()
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
  <RouterView />
  <FloatingThemeToggle />
  <AppToast />
  <AuthModal />
  <ImageLightboxModal />
  <WishlistDrawer />
  <CartDrawer />
</template>
