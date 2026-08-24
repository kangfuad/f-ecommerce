import { APP_CONFIG } from '@/core/config/app.config'
import { Product } from './Product'
import { DateRange } from '../value-objects/DateRange'
import { Money } from '../value-objects/Money'

export interface RentalBookingProps {
  product: Product
  dateRange: DateRange
  quantity?: number
  includeInsurance?: boolean
}

/**
 * RentalBooking Entity
 * Encapsulates the pricing rules: daily rate, discounts, insurance, and refundable deposit
 */
export class RentalBooking {
  public readonly product: Product
  public readonly dateRange: DateRange
  public readonly quantity: number
  public readonly includeInsurance: boolean

  constructor(props: RentalBookingProps) {
    this.product = props.product
    this.dateRange = props.dateRange
    this.quantity = props.quantity ?? 1
    this.includeInsurance = props.includeInsurance ?? true
  }

  public get durationDays(): number {
    return this.dateRange.durationDays
  }

  /**
   * Base rental price before discount: dailyRate × days × quantity
   */
  public get baseRentalPrice(): Money {
    return this.product.dailyRate
      .multiply(this.durationDays)
      .multiply(this.quantity)
  }

  /**
   * Discount percentage based on duration
   */
  public get discountPercentage(): number {
    if (this.durationDays >= APP_CONFIG.RENTAL.MONTHLY_DISCOUNT_DAYS_THRESHOLD) {
      return APP_CONFIG.RENTAL.MONTHLY_DISCOUNT_PERCENTAGE
    }
    if (this.durationDays >= APP_CONFIG.RENTAL.LONG_TERM_DISCOUNT_DAYS_THRESHOLD) {
      return APP_CONFIG.RENTAL.LONG_TERM_DISCOUNT_PERCENTAGE
    }
    return 0
  }

  public get discountAmount(): Money {
    if (this.discountPercentage === 0) return Money.zero()
    const discountVal = this.baseRentalPrice.amount * this.discountPercentage
    return Money.from(discountVal)
  }

  /**
   * Net rental price after discount
   */
  public get netRentalPrice(): Money {
    return this.baseRentalPrice.subtract(this.discountAmount)
  }

  /**
   * Insurance fee: feePerDay × days × quantity
   */
  public get insuranceFee(): Money {
    if (!this.includeInsurance) return Money.zero()
    return Money.from(APP_CONFIG.RENTAL.INSURANCE_FEE_PER_DAY * this.durationDays * this.quantity)
  }

  /**
   * Refundable deposit: product deposit × quantity
   */
  public get refundableDeposit(): Money {
    return this.product.depositAmount.multiply(this.quantity)
  }

  /**
   * Total due at checkout: Net Rental + Insurance + Deposit
   */
  public get totalCheckoutAmount(): Money {
    return this.netRentalPrice
      .add(this.insuranceFee)
      .add(this.refundableDeposit)
  }
}
