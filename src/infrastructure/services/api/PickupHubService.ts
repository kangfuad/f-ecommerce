import type { ApiResponse } from './ApiResponse'

export interface PickupHubDto {
  id: string
  name: string
  address: string
  city: string
  operationalHours?: string
  phone?: string
}

export class PickupHubService {
  public static async getPickupHubs(): Promise<ApiResponse<PickupHubDto[]>> {
    return {
      status: 'success',
      data: [
        {
          id: 'hub_gandaria_jkt',
          name: 'Hub Gandaria Jakarta Selatan (CinemaTech)',
          address: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
          city: 'Jakarta Selatan',
          operationalHours: '08:00 - 21:00 WIB',
          phone: '0812-3456-7890',
        },
        {
          id: 'hub_dago_bdg',
          name: 'Hub Dago Bandung (Parahyangan Gear)',
          address: 'Jl. Ir. H. Juanda No. 88, Dago, Bandung',
          city: 'Bandung',
          operationalHours: '09:00 - 20:00 WIB',
          phone: '0813-9988-7766',
        },
        {
          id: 'hub_kuta_bali',
          name: 'Hub Sunset Road Bali (Island Drone & Cine)',
          address: 'Jl. Sunset Road No. 101, Kuta, Badung, Bali',
          city: 'Badung',
          operationalHours: '08:00 - 22:00 WITA',
          phone: '0819-8765-4321',
        },
      ],
      message: 'Titik serah terima resmi berhasil dimuat.',
    }
  }
}
