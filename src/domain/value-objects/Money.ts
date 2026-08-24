import { formatRupiah } from '@/core/utils/currency'
import { ValidationException } from '@/core/errors/RentalException'

/**
 * Money Value Object
 * Immutable object encapsulating monetary amount & calculation
 */
export class Money {
  private readonly _amount: number

  constructor(amount: number) {
    if (isNaN(amount) || amount < 0) {
      throw new ValidationException(`Nominal uang tidak boleh bernilai negatif: ${amount}`)
    }
    this._amount = Math.round(amount)
  }

  public static from(amount: number): Money {
    return new Money(amount)
  }

  public static zero(): Money {
    return new Money(0)
  }

  public get amount(): number {
    return this._amount
  }

  public add(other: Money): Money {
    return new Money(this._amount + other._amount)
  }

  public subtract(other: Money): Money {
    const res = this._amount - other._amount
    if (res < 0) {
      throw new ValidationException('Hasil pengurangan nominal tidak boleh negatif')
    }
    return new Money(res)
  }

  public multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new ValidationException('Pengali tidak boleh negatif')
    }
    return new Money(Math.round(this._amount * multiplier))
  }

  public format(withPrefix = true): string {
    return formatRupiah(this._amount, withPrefix)
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount
  }
}
