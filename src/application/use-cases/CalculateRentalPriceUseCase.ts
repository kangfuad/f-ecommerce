import { Product } from '@/domain/entities/Product'
import { DateRange } from '@/domain/value-objects/DateRange'
import { RentalBooking } from '@/domain/entities/RentalBooking'
import { ItemUnavailableException } from '@/core/errors/RentalException'

export interface CalculationInput {
  product: Product
  startDate: Date | string
  endDate: Date | string
  quantity?: number
  includeInsurance?: boolean
}

/**
 * CalculateRentalPriceUseCase
 * Single Responsibility: Validating rental period and calculating exact pricing breakdown
 */
export class CalculateRentalPriceUseCase {
  public execute(input: CalculationInput): RentalBooking {
    if (!input.product.isAvailable()) {
      throw new ItemUnavailableException(input.product.name)
    }

    const dateRange = DateRange.create(input.startDate, input.endDate)

    return new RentalBooking({
      product: input.product,
      dateRange,
      quantity: input.quantity ?? 1,
      includeInsurance: input.includeInsurance ?? true,
    })
  }
}
