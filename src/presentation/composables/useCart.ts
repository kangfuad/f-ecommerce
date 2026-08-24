import { shallowRef, ref, computed, inject } from 'vue'
import { CartItem } from '@/domain/entities/CartItem'
import { Money } from '@/domain/value-objects/Money'
import { TOKENS } from '@/infrastructure/di/tokens'
import { DIContainer } from '@/infrastructure/di/container'
import type { AddToCartInput } from '@/application/use-cases/ManageCartUseCase'
import { APP_CONFIG } from '@/core/config/app.config'

// Global reactive state shared across components
const cartItems = shallowRef<CartItem[]>([])
const isCartOpen = ref(false)
const isLoading = ref(false)
const cartError = ref<string | null>(null)

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

  async function addToCart(input: AddToCartInput) {
    isLoading.value = true
    cartError.value = null
    try {
      cartItems.value = await manageCartUseCase.addToCart(input)
      isCartOpen.value = true
    } catch (err: any) {
      cartError.value = err.message || 'Gagal menambahkan barang ke keranjang'
      throw err
    } finally {
      isLoading.value = false
    }
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
    totalItemCount,
    subtotalRental,
    totalDeposit,
    isEligibleForFreeDelivery,
    estimatedDeliveryFee,
    grandTotal,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    openCart,
    closeCart,
  }
}
