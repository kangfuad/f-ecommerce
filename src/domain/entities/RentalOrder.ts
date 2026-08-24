export type DeliveryMethod = 'DELIVERY' | 'PICKUP'
export type PaymentMethodType = 'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'BRI_VA' | 'CREDIT_CARD'
export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'

export interface OrderCustomerInfo {
  fullName: string
  email: string
  phone: string
  deliveryMethod: DeliveryMethod
  deliveryAddress?: string
  pickupHub?: string
  ktpPhotoName?: string
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
  items: OrderItemSnapshot[]
  pricing: OrderPricingBreakdown
  paymentMethod: PaymentMethodType
  vaNumber?: string
  paymentStatus: PaymentStatus
  createdAt: Date
  paidAt?: Date
}

export class RentalOrder {
  public readonly id: string
  public readonly customer: OrderCustomerInfo
  public readonly items: OrderItemSnapshot[]
  public readonly pricing: OrderPricingBreakdown
  public readonly paymentMethod: PaymentMethodType
  public readonly vaNumber?: string
  public paymentStatus: PaymentStatus
  public readonly createdAt: Date
  public paidAt?: Date

  constructor(props: RentalOrderProps) {
    this.id = props.id
    this.customer = props.customer
    this.items = props.items
    this.pricing = props.pricing
    this.paymentMethod = props.paymentMethod
    this.vaNumber = props.vaNumber
    this.paymentStatus = props.paymentStatus
    this.createdAt = props.createdAt
    this.paidAt = props.paidAt
  }

  public get isPaid(): boolean {
    return this.paymentStatus === 'PAID'
  }

  public markAsPaid(): void {
    this.paymentStatus = 'PAID'
    this.paidAt = new Date()
  }

  public get paymentMethodLabel(): string {
    switch (this.paymentMethod) {
      case 'QRIS':
        return 'QRIS Real-Time (Semua E-Wallet & Mobile Banking)'
      case 'BCA_VA':
        return 'BCA Virtual Account'
      case 'MANDIRI_VA':
        return 'Mandiri Virtual Account'
      case 'BRI_VA':
        return 'BRI Virtual Account'
      case 'CREDIT_CARD':
        return 'Kartu Kredit / Debit Online'
      default:
        return this.paymentMethod
    }
  }
}
