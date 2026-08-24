export enum RentalStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
}

export const RentalStatusLabel: Record<RentalStatus, string> = {
  [RentalStatus.AVAILABLE]: 'Unit Tersedia',
  [RentalStatus.BOOKED]: 'Sedang Dibooking',
  [RentalStatus.RENTED]: 'Sedang Disewa',
  [RentalStatus.MAINTENANCE]: 'Dalam Perawatan',
}
