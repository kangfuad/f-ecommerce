import { APP_CONFIG } from '@/core/config/app.config'
import { RentalDurationException } from '@/core/errors/RentalException'
import { calculateDaysBetween, formatDateToIndonesian } from '@/core/utils/date'

/**
 * DateRange Value Object
 * Validates and encapsulates a rental period
 */
export class DateRange {
  private readonly _startDate: Date
  private readonly _endDate: Date
  private readonly _durationDays: number

  constructor(startDate: Date | string, endDate: Date | string) {
    const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate)
    const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate)

    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new RentalDurationException('Format tanggal sewa tidak valid')
    }

    if (end < start) {
      throw new RentalDurationException('Tanggal selesai sewa tidak boleh mendahului tanggal mulai sewa')
    }

    const duration = calculateDaysBetween(start, end)

    if (duration < APP_CONFIG.RENTAL.MIN_DURATION_DAYS) {
      throw new RentalDurationException(`Durasi sewa minimal adalah ${APP_CONFIG.RENTAL.MIN_DURATION_DAYS} hari`)
    }

    if (duration > APP_CONFIG.RENTAL.MAX_DURATION_DAYS) {
      throw new RentalDurationException(`Durasi sewa maksimal adalah ${APP_CONFIG.RENTAL.MAX_DURATION_DAYS} hari`)
    }

    this._startDate = start
    this._endDate = end
    this._durationDays = duration
  }

  public static create(startDate: Date | string, endDate: Date | string): DateRange {
    return new DateRange(startDate, endDate)
  }

  public get startDate(): Date {
    return new Date(this._startDate)
  }

  public get endDate(): Date {
    return new Date(this._endDate)
  }

  public get durationDays(): number {
    return this._durationDays
  }

  public get formattedRange(): string {
    return `${formatDateToIndonesian(this._startDate)} - ${formatDateToIndonesian(this._endDate)} (${this._durationDays} Hari)`
  }

  public toJSON() {
    return {
      startDate: this._startDate.toISOString().split('T')[0],
      endDate: this._endDate.toISOString().split('T')[0],
      durationDays: this._durationDays,
    }
  }
}
