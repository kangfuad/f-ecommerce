import { shallowRef, ref, computed, inject } from 'vue'
import { CartItem } from '@/domain/entities/CartItem'
import { Product } from '@/domain/entities/Product'
import { Money } from '@/domain/value-objects/Money'
import { TOKENS } from '@/infrastructure/di/tokens'
import { DIContainer } from '@/infrastructure/di/container'
import type { AddToCartInput } from '@/application/use-cases/ManageCartUseCase'
import { APP_CONFIG } from '@/core/config/app.config'

export interface CartToastNotification {
  id: string
  productName: string
  message: string
}

// Global reactive state shared across components
const cartItems = shallowRef<CartItem[]>([])
const isCartOpen = ref(false)
const isLoading = ref(false)
const cartError = ref<string | null>(null)
const cartToast = ref<CartToastNotification | null>(null)
const isCartBadgeBouncing = ref(false)

let toastTimeout: any = null
let badgeTimeout: any = null

export function useCart() {
  const manageCartUseCase = inject(TOKENS.MANAGE_CART_USE_CASE, DIContainer.manageCartUseCase)

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
    if (cartItems.value.length === 0 || isEligibleForFreeDelivery.value) {
      return Money.zero()
    }
    return Money.from(APP_CONFIG.RENTAL.DEFAULT_DELIVERY_FEE)
  })

  const grandTotal = computed(() =>
    subtotalRental.value.add(totalDeposit.value).add(estimatedDeliveryFee.value)
  )

  function triggerCartAnimation(productName?: string) {
    // 1. Trigger Badge Bounce in Header
    isCartBadgeBouncing.value = true
    if (badgeTimeout) clearTimeout(badgeTimeout)
    badgeTimeout = setTimeout(() => {
      isCartBadgeBouncing.value = false
    }, 1000)

    // 2. Trigger Subtle Notification Toast
    if (productName) {
      if (toastTimeout) clearTimeout(toastTimeout)
      cartToast.value = {
        id: Date.now().toString(),
        productName,
        message: `berhasil ditambahkan ke keranjang sewa`,
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

  async function quickAddToCart(product: Product, days: number = 3) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endDate = new Date(tomorrow)
    endDate.setDate(endDate.getDate() + (days - 1))

    await addToCart(
      {
        productId: product.id,
        startDate: tomorrow,
        endDate: endDate,
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

  async function removeItem(cartItemId: string) {
    try {
      cartItems.value = await manageCartUseCase.removeFromCart(cartItemId)
    } catch (err: any) {
      cartError.value = err.message || 'Gagal menghapus item dari keranjang'
    }
  }

  function dismissToast() {
    cartToast.value = null
  }

  function openCart() {
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
    dismissToast,
    updateQuantity,
    removeItem,
    openCart,
    closeCart,
  }
}
