import { shallowRef, ref, computed, inject } from 'vue'
import { CartItem } from '@/domain/entities/CartItem'
import { Product } from '@/domain/entities/Product'
import { Money } from '@/domain/value-objects/Money'
import { TOKENS } from '@/infrastructure/di/tokens'
import { DIContainer } from '@/infrastructure/di/container'
import type { AddToCartInput } from '@/application/use-cases/ManageCartUseCase'
import { APP_CONFIG } from '@/core/config/app.config'
import { isWishlistOpen } from './useWishlist'

import { useAuth } from './useAuth'
import { useToast } from './useToast'

export interface CartToastNotification {
  id: string
  productName: string
  message: string
}

// Global reactive state shared across components
const cartItems = shallowRef<CartItem[]>([])
export const isCartOpen = ref(false)
const isLoading = ref(false)
const cartError = ref<string | null>(null)
const cartToast = ref<CartToastNotification | null>(null)
const isCartBadgeBouncing = ref(false)

let toastTimeout: any = null
let badgeTimeout: any = null

export function useCart() {
  const manageCartUseCase = inject(TOKENS.MANAGE_CART_USE_CASE, DIContainer.manageCartUseCase)
  const { isLoggedIn, openLoginModal } = useAuth()
  const { showToast } = useToast()

  const totalItemCount = computed(() =>
    cartItems.value.reduce((total, item) => total + item.quantity, 0)
  )

  const subtotalRental = computed(() => {
    let total = 0
    for (const item of cartItems.value) {
      total += item.totalRentalAmount.amount
    }
    return Money.from(total)
  })

  const totalDeposit = computed(() => {
    let total = 0
    for (const item of cartItems.value) {
      total += item.totalDepositAmount.amount
    }
    return Money.from(total)
  })

  const isEligibleForFreeDelivery = computed(
    () => subtotalRental.value.amount >= APP_CONFIG.RENTAL.FREE_DELIVERY_THRESHOLD
  )

  const estimatedDeliveryFee = computed(() => {
    if (isEligibleForFreeDelivery.value) {
      return Money.zero()
    }
    return Money.from(APP_CONFIG.RENTAL.DEFAULT_DELIVERY_FEE)
  })

  const grandTotal = computed(() => {
    return subtotalRental.value.add(totalDeposit.value).add(estimatedDeliveryFee.value)
  })

  function triggerCartAnimation(productName?: string) {
    // 1. Trigger bounce animation on navbar cart button
    isCartBadgeBouncing.value = true
    if (badgeTimeout) clearTimeout(badgeTimeout)
    badgeTimeout = setTimeout(() => {
      isCartBadgeBouncing.value = false
    }, 900)

    // 2. Trigger non-intrusive toast alert
    if (productName) {
      if (toastTimeout) clearTimeout(toastTimeout)
      cartToast.value = {
        id: `toast_${Date.now()}`,
        productName,
        message: 'Berhasil dimasukkan ke keranjang sewa!',
      }
      toastTimeout = setTimeout(() => {
        cartToast.value = null
      }, 3000)
    }
  }

  async function loadCart() {
    isLoading.value = true
    cartError.value = null
    try {
      cartItems.value = await manageCartUseCase.getCartItems()
    } catch (err: any) {
      cartError.value = err.message || 'Gagal memuat keranjang sewa'
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart(input: AddToCartInput, openDrawer: boolean = false, productName?: string) {
    if (!isLoggedIn.value) {
      showToast({
        type: 'warning',
        title: 'Masuk Akun Diperlukan',
        message: 'Silakan masuk ke akun Anda atau daftar member untuk menyewa dan memasukkan unit ke keranjang.',
      })
      openLoginModal()
      return
    }

    isLoading.value = true
    cartError.value = null
    try {
      cartItems.value = await manageCartUseCase.addToCart(input)
      
      // Trigger non-intrusive animation and toast instead of forced drawer opening
      triggerCartAnimation(productName)

      if (openDrawer) {
        isCartOpen.value = true
      }
    } catch (err: any) {
      cartError.value = err.message || 'Gagal menambahkan barang ke keranjang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function quickAddToCart(product: Product, customStart?: string | Date, customEnd?: string | Date) {
    let start: Date
    let end: Date

    if (customStart && customEnd) {
      start = typeof customStart === 'string' ? new Date(customStart) : customStart
      end = typeof customEnd === 'string' ? new Date(customEnd) : customEnd
    } else {
      start = new Date()
      start.setDate(start.getDate() + 1)
      end = new Date(start)
      end.setDate(end.getDate() + 2) // 3 days default
    }

    await addToCart(
      {
        productId: product.id,
        startDate: start,
        endDate: end,
        quantity: 1,
        includeInsurance: true,
      },
      false, // Do NOT open drawer
      product.name // Provide product name for toast
    )
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    try {
      cartItems.value = await manageCartUseCase.updateItemQuantity(cartItemId, newQuantity)
    } catch (err: any) {
      cartError.value = err.message || 'Gagal memperbarui kuantitas'
    }
  }

  async function updateItemDates(cartItemId: string, startDate: Date | string, endDate: Date | string) {
    isLoading.value = true
    cartError.value = null
    try {
      cartItems.value = await manageCartUseCase.updateItemDates(cartItemId, startDate, endDate)
    } catch (err: any) {
      cartError.value = err.message || 'Gagal memperbarui tanggal sewa'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeItem(cartItemId: string) {
    try {
      cartItems.value = await manageCartUseCase.removeFromCart(cartItemId)
    } catch (err: any) {
      cartError.value = err.message || 'Gagal menghapus item dari keranjang'
    }
  }

  async function clearCart() {
    try {
      for (const item of [...cartItems.value]) {
        await manageCartUseCase.removeFromCart(item.id)
      }
      cartItems.value = []
    } catch (err: any) {
      console.warn('Failed to clear cart:', err)
    }
  }

  async function removeItemsByProductIds(productIds: string[]) {
    try {
      for (const item of [...cartItems.value]) {
        if (productIds.includes(item.product.id)) {
          await manageCartUseCase.removeFromCart(item.id)
        }
      }
      cartItems.value = await manageCartUseCase.getCartItems()
    } catch (err: any) {
      console.warn('Failed to remove items by product IDs:', err)
    }
  }

  function dismissToast() {
    cartToast.value = null
  }

  function openCart() {
    isWishlistOpen.value = false
    isCartOpen.value = true
  }

  function closeCart() {
    isCartOpen.value = false
  }

  return {
    cartItems,
    isCartOpen,
    isLoading,
    cartError,
    cartToast,
    isCartBadgeBouncing,
    totalItemCount,
    subtotalRental,
    totalDeposit,
    isEligibleForFreeDelivery,
    estimatedDeliveryFee,
    grandTotal,
    loadCart,
    addToCart,
    quickAddToCart,
    updateItemDates,
    dismissToast,
    updateQuantity,
    removeItem,
    clearCart,
    removeItemsByProductIds,
    openCart,
    closeCart,
  }
}
