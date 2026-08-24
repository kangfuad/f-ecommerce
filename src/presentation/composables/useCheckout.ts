import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from './useCart'
import { useAuth } from './useAuth'
import {
  RentalOrder,
  type DeliveryMethod,
  type PaymentMethodType,
  type OrderItemSnapshot,
} from '@/domain/entities/RentalOrder'
import { formatDateToISO } from '@/core/utils/date'

const CHECKOUT_ORDER_KEY = 'epunyasewa_active_order'

// Form reactive states
const fullName = ref('')
const email = ref('')
const phone = ref('')
const deliveryMethod = ref<DeliveryMethod>('DELIVERY')
const deliveryAddress = ref('')
const pickupHub = ref('Hub Jakarta Selatan (Gandaria)')
const ktpPhotoName = ref('')
const selectedPaymentMethod = ref<PaymentMethodType>('QRIS')
const agreeTerms = ref(true)

// Active Order state
const currentOrder = ref<RentalOrder | null>(null)
const isSubmitting = ref(false)
const checkoutError = ref<string | null>(null)

// Countdown timer (15 minutes in seconds)
const timeLeftSeconds = ref(900)
let timerInterval: any = null

export const AVAILABLE_PICKUP_HUBS = [
  'Hub Jakarta Selatan (Gandaria / Pondok Indah)',
  'Hub BSD Serpong (The Breeze)',
  'Hub Jakarta Barat (Central Park)',
  'Hub Jakarta Pusat (Sudirman / Thamrin)',
  'Hub Bandung (Dago / Riau)',
]

export function useCheckout() {
  const router = useRouter()
  const { cartItems, grandTotal, subtotalRental, totalDeposit, estimatedDeliveryFee, removeItem } = useCart()
  const { currentUser } = useAuth()

  function initForm() {
    if (currentUser.value) {
      fullName.value = currentUser.value.fullName
      email.value = currentUser.value.email
      phone.value = currentUser.value.phone
    }
  }

  // Generate dynamic VA number based on selected bank
  function generateVaNumber(method: PaymentMethodType): string {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString()
    switch (method) {
      case 'BCA_VA':
        return `80777${randomSuffix.slice(0, 8)}`
      case 'MANDIRI_VA':
        return `88908${randomSuffix.slice(0, 8)}`
      case 'BRI_VA':
        return `12800${randomSuffix.slice(0, 8)}`
      default:
        return `80777${randomSuffix.slice(0, 8)}`
    }
  }

  // Format countdown mm:ss
  const formattedCountdown = computed(() => {
    const minutes = Math.floor(timeLeftSeconds.value / 60)
    const seconds = timeLeftSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  function startCountdown() {
    if (timerInterval) clearInterval(timerInterval)
    timeLeftSeconds.value = 900
    timerInterval = setInterval(() => {
      if (timeLeftSeconds.value > 0) {
        timeLeftSeconds.value--
      } else {
        clearInterval(timerInterval)
      }
    }, 1000)
  }

  // Create Order and Proceed to Payment Step
  async function createOrder(): Promise<RentalOrder> {
    if (cartItems.value.length === 0) {
      throw new Error('Keranjang sewa Anda kosong.')
    }

    if (!fullName.value.trim() || !email.value.trim() || !phone.value.trim()) {
      throw new Error('Silakan lengkapi data kontak penyewa.')
    }

    if (deliveryMethod.value === 'DELIVERY' && !deliveryAddress.value.trim()) {
      throw new Error('Silakan masukkan alamat pengiriman unit sewa.')
    }

    if (!agreeTerms.value) {
      throw new Error('Anda wajib menyetujui syarat & ketentuan sewa e-punyasewa.')
    }

    isSubmitting.value = true
    checkoutError.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const orderId = `EPS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`

      const itemSnapshots: OrderItemSnapshot[] = cartItems.value.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        primaryImage: item.product.primaryImage,
        quantity: item.quantity,
        rentalDays: item.dateRange.durationDays,
        startDate: formatDateToISO(item.dateRange.startDate),
        endDate: formatDateToISO(item.dateRange.endDate),
        dailyRate: item.product.dailyRate.amount,
        depositRate: item.product.depositAmount.amount,
        totalAmount: item.totalAmount.amount,
      }))

      const isDepositWaived = currentUser.value?.isKycVerified || false

      // Calculate deposit: if KYC verified, deposit is 0!
      const effectiveDeposit = isDepositWaived ? 0 : totalDeposit.value.amount
      const effectiveGrandTotal = subtotalRental.value.amount + effectiveDeposit + estimatedDeliveryFee.value.amount

      const order = new RentalOrder({
        id: orderId,
        customer: {
          fullName: fullName.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          deliveryMethod: deliveryMethod.value,
          deliveryAddress: deliveryMethod.value === 'DELIVERY' ? deliveryAddress.value.trim() : undefined,
          pickupHub: deliveryMethod.value === 'PICKUP' ? pickupHub.value : undefined,
          ktpPhotoName: ktpPhotoName.value || 'KTP-Verified.jpg',
        },
        items: itemSnapshots,
        pricing: {
          subtotalRental: subtotalRental.value.amount,
          totalDeposit: effectiveDeposit,
          isDepositWaived,
          deliveryFee: estimatedDeliveryFee.value.amount,
          grandTotal: effectiveGrandTotal,
        },
        paymentMethod: selectedPaymentMethod.value,
        vaNumber: selectedPaymentMethod.value.includes('VA') ? generateVaNumber(selectedPaymentMethod.value) : undefined,
        paymentStatus: 'PENDING',
        createdAt: new Date(),
      })

      currentOrder.value = order
      localStorage.setItem(CHECKOUT_ORDER_KEY, JSON.stringify(order))
      startCountdown()

      return order
    } catch (err: any) {
      checkoutError.value = err.message || 'Gagal memproses pesanan sewa.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // Simulate Instant Payment Confirmation
  async function simulatePaymentSuccess(): Promise<void> {
    if (!currentOrder.value) return
    isSubmitting.value = true

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      currentOrder.value.markAsPaid()
      localStorage.setItem(CHECKOUT_ORDER_KEY, JSON.stringify(currentOrder.value))

      if (timerInterval) clearInterval(timerInterval)

      // Clear cart items
      for (const item of [...cartItems.value]) {
        await removeItem(item.id)
      }

      router.push(`/order-success/${currentOrder.value.id}`)
    } finally {
      isSubmitting.value = false
    }
  }

  function loadOrderFromStorage(orderId?: string): RentalOrder | null {
    try {
      const raw = localStorage.getItem(CHECKOUT_ORDER_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (!orderId || parsed.id === orderId) {
          const order = new RentalOrder({
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            paidAt: parsed.paidAt ? new Date(parsed.paidAt) : undefined,
          })
          currentOrder.value = order
          return order
        }
      }
    } catch {
      // Fallback
    }
    return null
  }

  return {
    fullName,
    email,
    phone,
    deliveryMethod,
    deliveryAddress,
    pickupHub,
    ktpPhotoName,
    selectedPaymentMethod,
    agreeTerms,
    currentOrder,
    isSubmitting,
    checkoutError,
    timeLeftSeconds,
    formattedCountdown,
    initForm,
    createOrder,
    simulatePaymentSuccess,
    loadOrderFromStorage,
  }
}
