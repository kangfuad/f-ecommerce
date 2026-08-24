import { shallowRef, ref, computed } from 'vue'
import { LocalStorageAdapter } from '@/infrastructure/storage/LocalStorageAdapter'
import { APP_CONFIG } from '@/core/config/app.config'
import { DIContainer } from '@/infrastructure/di/container'
import { Product } from '@/domain/entities/Product'
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

  function toggleWishlist(productId: string): boolean {
    if (!isLoggedIn.value) {
      showToast({
        type: 'warning',
        title: 'Masuk Akun Diperlukan',
        message: 'Silakan masuk ke akun Anda atau daftar member untuk menyimpan produk favorit.',
      })
      openLoginModal()
      return false
    }

    const index = wishlistIds.value.indexOf(productId)
    if (index > -1) {
      wishlistIds.value.splice(index, 1)
    } else {
      wishlistIds.value.push(productId)
    }
    LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, wishlistIds.value)
    return isWishlisted(productId)
  }

  function removeWishlist(productId: string): void {
    const index = wishlistIds.value.indexOf(productId)
    if (index > -1) {
      wishlistIds.value.splice(index, 1)
      LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, wishlistIds.value)
    }
  }

  function clearWishlist(): void {
    wishlistIds.value = []
    LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, [])
  }

  function openWishlist(): void {
    loadProductsIfNeeded()
    isWishlistOpen.value = true
  }

  function closeWishlist(): void {
    isWishlistOpen.value = false
  }

  // Pre-fetch products
  loadProductsIfNeeded()

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
