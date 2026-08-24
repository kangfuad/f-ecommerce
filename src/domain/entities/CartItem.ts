import { Product } from './Product'
import { DateRange } from '../value-objects/DateRange'
import { RentalBooking } from './RentalBooking'
import { Money } from '../value-objects/Money'

export interface CartItemProps {
  id: string
  product: Product
  dateRange: DateRange
  quantity: number
  includeInsurance: boolean
  createdAt: Date
}

/**
 * CartItem Entity
 */
export class CartItem {
  public readonly id: string
  public readonly product: Product
  public dateRange: DateRange
  public quantity: number
  public includeInsurance: boolean
  public readonly createdAt: Date

  constructor(props: CartItemProps) {
    this.id = props.id
    this.product = props.product
    this.dateRange = props.dateRange
    this.quantity = props.quantity
    this.includeInsurance = props.includeInsurance
    this.createdAt = props.createdAt
  }

  public get booking(): RentalBooking {
    return new RentalBooking({
      product: this.product,
      dateRange: this.dateRange,
      quantity: this.quantity,
      includeInsurance: this.includeInsurance,
    })
  }

  public get totalRentalAmount(): Money {
    return this.booking.netRentalPrice
  }

  public get totalDepositAmount(): Money {
    return this.booking.refundableDeposit
  }

  public get totalAmount(): Money {
    return this.booking.totalCheckoutAmount
  }

  public toJSON() {
    return {
      id: this.id,
      productId: this.product.id,
      startDate: this.dateRange.startDate.toISOString().split('T')[0],
      endDate: this.dateRange.endDate.toISOString().split('T')[0],
      quantity: this.quantity,
      includeInsurance: this.includeInsurance,
      createdAt: this.createdAt.toISOString(),
    }
  }
}
