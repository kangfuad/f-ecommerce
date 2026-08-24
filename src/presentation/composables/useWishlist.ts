import { ref } from 'vue'
import { LocalStorageAdapter } from '@/infrastructure/storage/LocalStorageAdapter'
import { APP_CONFIG } from '@/core/config/app.config'

const wishlistIds = ref<string[]>(
  LocalStorageAdapter.getItem<string[]>(APP_CONFIG.STORAGE_KEYS.WISHLIST, [])
)

export function useWishlist() {
  function isWishlisted(productId: string): boolean {
    return wishlistIds.value.includes(productId)
  }

  function toggleWishlist(productId: string): boolean {
    const index = wishlistIds.value.indexOf(productId)
    if (index > -1) {
      wishlistIds.value.splice(index, 1)
    } else {
      wishlistIds.value.push(productId)
    }
    LocalStorageAdapter.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, wishlistIds.value)
    return isWishlisted(productId)
  }

  return {
    wishlistIds,
    isWishlisted,
    toggleWishlist,
  }
}
