import { apiClient } from './ApiClient'
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
  private static cachedHubs: PickupHubDto[] | null = null

  public static async getPickupHubs(): Promise<ApiResponse<PickupHubDto[]>> {
    if (this.cachedHubs) {
      return {
        status: 'success',
        data: this.cachedHubs,
        message: 'Pickup hubs retrieved from cache',
      }
    }

    const response = await apiClient.get<PickupHubDto[]>('/data/pickup-hubs.json')
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.cachedHubs = response.data
    }
    return response
  }
}
