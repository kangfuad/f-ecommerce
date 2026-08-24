<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToast from '@/presentation/components/common/AppToast.vue'
import AuthModal from '@/presentation/components/auth/AuthModal.vue'
import ImageLightboxModal from '@/presentation/components/common/ImageLightboxModal.vue'
</script>

<template>
  <RouterView />
  <AppToast />
  <AuthModal />
  <ImageLightboxModal />
</template>
