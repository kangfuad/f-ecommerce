import { BaseException } from './BaseException'

export class RentalDurationException extends BaseException {
  constructor(message = 'Durasi sewa tidak valid') {
    super(message, 'INVALID_RENTAL_DURATION')
  }
}

export class ItemUnavailableException extends BaseException {
  constructor(itemName: string) {
    super(`Barang sewa "${itemName}" sedang tidak tersedia pada tanggal yang dipilih.`, 'ITEM_UNAVAILABLE')
  }
}

export class DepositValidationException extends BaseException {
  constructor(message = 'Nilai deposit jaminan sewa tidak valid') {
    super(message, 'INVALID_DEPOSIT_VALUE')
  }
}

export class ValidationException extends BaseException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
  }
}
