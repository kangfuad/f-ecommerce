import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'

export interface CityDto {
  id: string
  name: string
  province: string
  isHub: boolean
}

export class CityService {
  private static cachedCities: CityDto[] | null = null

  public static async getCities(): Promise<ApiResponse<CityDto[]>> {
    if (this.cachedCities) {
      return {
        status: 'success',
        data: this.cachedCities,
        message: 'Cities retrieved from cache',
      }
    }

    const response = await apiClient.get<CityDto[]>('/data/cities.json')
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.cachedCities = response.data
    }
    return response
  }
}
