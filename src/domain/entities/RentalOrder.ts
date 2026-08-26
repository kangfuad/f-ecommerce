import type { RentalReview } from './RentalReview'

export type RentalLifecycleStatus =
  | 'PENDING_CONFIRMATION' // Menunggu Konfirmasi Penyedia
  | 'CONFIRMED'            // Dikonfirmasi Penyedia (Menunggu Serah Terima)
  | 'ACTIVE_RENTAL'        // Unit Diserahkan & Sedang Berjalan
  | 'COMPLETED'            // Selesai (TTD Form & Bill Diupload)
  | 'REJECTED'             // Ditolak oleh Penyedia
  | 'CANCELLED'            // Dibatalkan oleh Penyewa

export type MeetupLocationType = 'PROVIDER_STUDIO' | 'TENANT_ADDRESS' | 'CUSTOM_MEETUP'

export interface OrderCustomerInfo {
  fullName: string
  email: string
  phone: string
  deliveryAddress?: string
  ktpPhotoName?: string
  membershipTier?: string
  isKycVerified?: boolean
}

export interface ProviderInfo {
  id: string
  name: string
  phone: string
  address: string
  rating?: number
  avatarUrl?: string
}

export interface MeetupInfo {
  locationType: MeetupLocationType
  locationName: string
  locationAddress: string
  scheduleDate: string
  scheduleTime: string
  notes?: string
}

export interface OrderItemSnapshot {
  productId: string
  productName: string
  primaryImage: string
  quantity: number
  rentalDays: number
  startDate: string
  endDate: string
  dailyRate: number
  depositRate: number
  totalAmount: number
}

export interface OrderPricingBreakdown {
  subtotalRental: number
  totalDeposit: number
  isDepositWaived: boolean
  deliveryFee: number
  grandTotal: number
}

export interface RentalOrderProps {
  id: string
  customer: OrderCustomerInfo
  provider?: ProviderInfo
  items: OrderItemSnapshot[]
  pricing: OrderPricingBreakdown
  meetup: MeetupInfo
  bookingNotes?: string
  lifecycleStatus: RentalLifecycleStatus
  createdAt: Date
  confirmedAt?: Date
  completedAt?: Date
  rejectionReason?: string
  signedAgreementUrl?: string
  paymentBillUrl?: string
  userReview?: RentalReview
  providerReview?: RentalReview
}

export class RentalOrder {
  public readonly id: string
  public readonly customer: OrderCustomerInfo
  public readonly provider?: ProviderInfo
  public readonly items: OrderItemSnapshot[]
  public readonly pricing: OrderPricingBreakdown
  public readonly meetup: MeetupInfo
  public readonly bookingNotes?: string
  public lifecycleStatus: RentalLifecycleStatus
  public readonly createdAt: Date
  public confirmedAt?: Date
  public completedAt?: Date
  public rejectionReason?: string
  public signedAgreementUrl?: string
  public paymentBillUrl?: string
  public userReview?: RentalReview
  public providerReview?: RentalReview

  constructor(props: RentalOrderProps) {
    this.id = props.id
    this.customer = props.customer
    this.provider = props.provider
    this.items = props.items
    this.pricing = props.pricing
    this.meetup = props.meetup
    this.bookingNotes = props.bookingNotes
    this.lifecycleStatus = props.lifecycleStatus
    this.createdAt = props.createdAt
    this.confirmedAt = props.confirmedAt
    this.completedAt = props.completedAt
    this.rejectionReason = props.rejectionReason
    this.signedAgreementUrl = props.signedAgreementUrl
    this.paymentBillUrl = props.paymentBillUrl
    this.userReview = props.userReview
    this.providerReview = props.providerReview
  }

  public get isCompleted(): boolean {
    return this.lifecycleStatus === 'COMPLETED'
  }

  public get isConfirmed(): boolean {
    return this.lifecycleStatus === 'CONFIRMED' || this.lifecycleStatus === 'ACTIVE_RENTAL' || this.lifecycleStatus === 'COMPLETED'
  }

  public get isPending(): boolean {
    return this.lifecycleStatus === 'PENDING_CONFIRMATION'
  }

  public get isRejected(): boolean {
    return this.lifecycleStatus === 'REJECTED'
  }

  public get isCancelled(): boolean {
    return this.lifecycleStatus === 'CANCELLED'
  }

  public get statusBadgeLabel(): string {
    switch (this.lifecycleStatus) {
      case 'PENDING_CONFIRMATION':
        return 'Menunggu Konfirmasi'
      case 'CONFIRMED':
        return 'Dikonfirmasi'
      case 'ACTIVE_RENTAL':
        return 'Sewa Aktif'
      case 'COMPLETED':
        return 'Selesai'
      case 'REJECTED':
        return 'Ditolak Penyedia'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return this.lifecycleStatus
    }
  }

  public get meetupLocationTypeLabel(): string {
    switch (this.meetup.locationType) {
      case 'PROVIDER_STUDIO':
        return 'Studio Resmi Penyedia'
      case 'TENANT_ADDRESS':
        return 'Alamat Domisili Penyewa'
      case 'CUSTOM_MEETUP':
        return 'Titik Temu Khusus / Lokasi Syuting'
      default:
        return 'Titik Temu'
    }
  }
}
