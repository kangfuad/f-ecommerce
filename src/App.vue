<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToast from '@/presentation/components/common/AppToast.vue'
import AuthModal from '@/presentation/components/auth/AuthModal.vue'
import ImageLightboxModal from '@/presentation/components/common/ImageLightboxModal.vue'
import WishlistDrawer from '@/presentation/components/wishlist/WishlistDrawer.vue'
import CartDrawer from '@/presentation/components/cart/CartDrawer.vue'
import FloatingThemeToggle from '@/presentation/components/common/FloatingThemeToggle.vue'
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
