import { shallowRef, ref, computed, watch } from 'vue'
import { LocalStorageAdapter } from '@/infrastructure/storage/LocalStorageAdapter'
import { APP_CONFIG } from '@/core/config/app.config'
import { DIContainer } from '@/infrastructure/di/container'
import { Product } from '@/domain/entities/Product'
import { FavoriteService } from '@/infrastructure/services/api'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

const wishlistIds = ref<string[]>(
  LocalStorageAdapter.getItem<string[]>(APP_CONFIG.STORAGE_KEYS.WISHLIST, [])
)

export const isWishlistOpen = ref(false)
const allProducts = shallowRef<Product[]>([])
let isProductsLoaded = false

export function useWishlist() {
  const { isLoggedIn, openLoginModal } = useAuth()
  const { showToast } = useToast()

  async function syncFavoritesFromApi() {
    if (!isLoggedIn.value) return
    try {
      const res = await FavoriteService.getFavorites()
      if (res.status === 'success' && Array.isArray(res.data)) {
        const ids = res.data.map((f) => f.productId)
        wishlistIds.value = ids
        LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, ids)
      }
    } catch (e) {
      console.warn('Failed to sync favorites from API:', e)
    }
  }

  async function loadProductsIfNeeded() {
    if (!isProductsLoaded || allProducts.value.length === 0) {
      try {
        const prods = await DIContainer.productRepository.getAll()
        allProducts.value = prods
        isProductsLoaded = true
      } catch (e) {
        console.error('Failed to load products for wishlist:', e)
      }
    }
  }

  const wishlistProducts = computed(() => {
    return allProducts.value.filter((p) => wishlistIds.value.includes(p.id))
  })

  function isWishlisted(productId: string): boolean {
    return wishlistIds.value.includes(productId)
  }

  async function toggleWishlist(productId: string): Promise<boolean> {
    if (!isLoggedIn.value) {
      showToast({
        type: 'warning',
        title: 'Masuk Akun Diperlukan',
        message: 'Silakan masuk ke akun Anda atau daftar member untuk menyimpan produk favorit.',
      })
      openLoginModal()
      return false
    }

    // 1. Optimistic local update
    const index = wishlistIds.value.indexOf(productId)
    let added = false
    if (index > -1) {
      wishlistIds.value.splice(index, 1)
      added = false
    } else {
      wishlistIds.value.push(productId)
      added = true
    }
    LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, wishlistIds.value)

    // 2. Sync with Database API
    try {
      await FavoriteService.toggleFavorite(productId)
    } catch (e) {
      console.warn('Failed to toggle favorite on server:', e)
    }

    return added
  }

  async function removeWishlist(productId: string): Promise<void> {
    const index = wishlistIds.value.indexOf(productId)
    if (index > -1) {
      wishlistIds.value.splice(index, 1)
      LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, wishlistIds.value)
    }
    if (isLoggedIn.value) {
      try {
        await FavoriteService.removeFavorite(productId)
      } catch (e) {
        console.warn('Failed to remove favorite on server:', e)
      }
    }
  }

  function clearWishlist(): void {
    wishlistIds.value = []
    LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, [])
  }

  function openWishlist(): void {
    loadProductsIfNeeded()
    if (isLoggedIn.value) {
      syncFavoritesFromApi()
    }
    isWishlistOpen.value = true
  }

  function closeWishlist(): void {
    isWishlistOpen.value = false
  }

  // Pre-fetch products
  loadProductsIfNeeded()

  watch(
    isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        syncFavoritesFromApi()
      }
    },
    { immediate: true }
  )

  return {
    wishlistIds,
    wishlistProducts,
    isWishlistOpen,
    isWishlisted,
    toggleWishlist,
    removeWishlist,
    clearWishlist,
    openWishlist,
    closeWishlist,
  }
}
