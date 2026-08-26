import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from './useCart'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import {
  RentalOrder,
  type MeetupLocationType,
  type MeetupInfo,
  type OrderItemSnapshot,
  type OrderPricingBreakdown,
} from '@/domain/entities/RentalOrder'
import { OrderService, type CreateBookingDto } from '@/infrastructure/services/api/OrderService'

// Form reactive states
const fullName = ref('')
const email = ref('')
const phone = ref('')
const deliveryAddress = ref('')

// Meetup & Serah Terima State
const meetupLocationType = ref<MeetupLocationType>('PROVIDER_STUDIO')
const meetupLocationName = ref('Studio CinemaTech Rental Gandaria')
const meetupLocationAddress = ref('Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan')
const meetupScheduleDate = ref('')
const meetupScheduleTime = ref('09:00 WIB')
const meetupNotes = ref('')
const bookingNotes = ref('')
const agreeTerms = ref(true)

// Active Order state
const currentOrder = ref<RentalOrder | null>(null)
const isSubmitting = ref(false)
const checkoutError = ref<string | null>(null)

export const DEFAULT_STUDIO_HUBS = [
  {
    name: 'Studio CinemaTech Rental Gandaria',
    address: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
  },
  {
    name: 'Studio SkyDrone BSD Hub (The Breeze)',
    address: 'The Breeze BSD City Blok L-08, Tangerang Selatan',
  },
  {
    name: 'Studio LightMaster Kemang Hub',
    address: 'Jl. Kemang Raya No. 34, Jakarta Selatan',
  },
  {
    name: 'Studio Pusat SCBD Senayan',
    address: 'Kawasan SCBD Lot 8, Senayan, Jakarta Pusat',
  },
]

export function useCheckout() {
  const router = useRouter()
  const { cartItems, subtotalRental, totalDeposit, grandTotal, clearCart } = useCart()
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  function initForm() {
    if (currentUser.value) {
      fullName.value = currentUser.value.fullName
      email.value = currentUser.value.email
      phone.value = currentUser.value.phone
      if (currentUser.value.savedAddresses && currentUser.value.savedAddresses.length > 0 && !deliveryAddress.value) {
        deliveryAddress.value = currentUser.value.savedAddresses[0].fullAddress
      }
    }

    // Set default meetup date from cart item if available
    if (cartItems.value.length > 0 && !meetupScheduleDate.value) {
      meetupScheduleDate.value = cartItems.value[0].dateRange.startDate.toISOString().split('T')[0]
    }
  }

  // Reactive watcher: Auto-populate form when user logs in
  watch(
    currentUser,
    (newUser) => {
      if (newUser) {
        fullName.value = newUser.fullName
        email.value = newUser.email
        phone.value = newUser.phone
      }
    },
    { immediate: true }
  )

  // Quick switch meetup location type
  function setLocationType(type: MeetupLocationType) {
    meetupLocationType.value = type
    if (type === 'PROVIDER_STUDIO') {
      meetupLocationName.value = DEFAULT_STUDIO_HUBS[0].name
      meetupLocationAddress.value = DEFAULT_STUDIO_HUBS[0].address
    } else if (type === 'TENANT_ADDRESS') {
      meetupLocationName.value = 'Alamat Domisili Penyewa'
      meetupLocationAddress.value = deliveryAddress.value || 'Alamat penyewa yang tercantum di profil KYC'
    } else {
      meetupLocationName.value = 'Titik Temu Khusus / Lokasi Syuting'
      meetupLocationAddress.value = ''
    }
  }

  // Validation
  const isValidForm = computed(() => {
    return (
      fullName.value.trim().length >= 2 &&
      email.value.includes('@') &&
      phone.value.trim().length >= 8 &&
      meetupScheduleDate.value.length >= 8 &&
      meetupLocationAddress.value.trim().length >= 3 &&
      agreeTerms.value &&
      cartItems.value.length > 0
    )
  })

  // Submit Booking Request (Direct Booking Flow)
  async function submitBookingRequest(): Promise<boolean> {
    if (!isValidForm.value) {
      checkoutError.value = 'Mohon lengkapi data pemesan, jadwal temu, dan lokasi serah terima unit.'
      return false
    }

    isSubmitting.value = true
    checkoutError.value = null

    try {
      const itemsSnapshot: OrderItemSnapshot[] = cartItems.value.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        primaryImage: item.product.primaryImage,
        quantity: item.quantity,
        rentalDays: item.booking.durationDays,
        startDate: item.dateRange.startDate.toISOString().split('T')[0],
        endDate: item.dateRange.endDate.toISOString().split('T')[0],
        dailyRate: item.product.dailyRate.amount,
        depositRate: item.product.depositAmount.amount,
        totalAmount: item.totalRentalAmount.amount,
      }))

      const pricingSnapshot: OrderPricingBreakdown = {
        subtotalRental: subtotalRental.value.amount,
        totalDeposit: 0,
        isDepositWaived: true,
        deliveryFee: 0,
        grandTotal: subtotalRental.value.amount,
      }

      const meetupSnapshot: MeetupInfo = {
        locationType: meetupLocationType.value,
        locationName: meetupLocationName.value,
        locationAddress: meetupLocationAddress.value,
        scheduleDate: meetupScheduleDate.value,
        scheduleTime: meetupScheduleTime.value,
        notes: meetupNotes.value,
      }

      const dto: CreateBookingDto = {
        customer: {
          fullName: fullName.value,
          email: email.value,
          phone: phone.value,
          deliveryAddress: deliveryAddress.value,
          membershipTier: (currentUser.value as any)?.membershipTier || (currentUser.value as any)?.memberTier || 'MEMBER',
          isKycVerified: currentUser.value?.isKycVerified || false,
        },
        items: itemsSnapshot,
        meetup: meetupSnapshot,
        bookingNotes: bookingNotes.value,
        pricing: pricingSnapshot,
      }

      const res = await OrderService.submitBooking(dto)

      if (res.status === 'success' && res.data) {
        currentOrder.value = new RentalOrder({
          id: res.data.id,
          customer: res.data.customer,
          provider: res.data.provider,
          items: res.data.items,
          pricing: res.data.pricing,
          meetup: res.data.meetup,
          bookingNotes: res.data.bookingNotes,
          lifecycleStatus: res.data.lifecycleStatus,
          createdAt: new Date(res.data.createdAt),
        })

        // Clear cart after successful booking
        clearCart()

        showToast({
          type: 'success',
          title: 'Pengajuan Booking Berhasil!',
          message: 'Permintaan sewa Anda telah dikirim ke penyedia sewa untuk dikonfirmasi.',
        })

        // Navigate to My Orders
        router.push('/pesanan-saya')
        return true
      } else {
        checkoutError.value = res.message || 'Gagal mengirim pengajuan booking.'
        return false
      }
    } catch (e: any) {
      checkoutError.value = e.message || 'Terjadi kesalahan sistem saat mengirim booking.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    fullName,
    email,
    phone,
    deliveryAddress,
    meetupLocationType,
    meetupLocationName,
    meetupLocationAddress,
    meetupScheduleDate,
    meetupScheduleTime,
    meetupNotes,
    bookingNotes,
    agreeTerms,
    currentOrder,
    isSubmitting,
    checkoutError,
    isValidForm,
    initForm,
    setLocationType,
    submitBookingRequest,
  }
}
