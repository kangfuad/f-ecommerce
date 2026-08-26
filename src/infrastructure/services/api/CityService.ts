import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'
import { toTitleCase } from './RegionService'

export interface CityDto {
  id: string
  name: string
  province: string
  isHub: boolean
}

export class CityService {
  public static async getCities(): Promise<ApiResponse<CityDto[]>> {
    const res = await apiClient.get<any[]>(API_ENDPOINTS.REGIONS.REGENCIES)
    if (res.status === 'success' && Array.isArray(res.data)) {
      const cities: CityDto[] = res.data.map((r) => ({
        id: r.id,
        name: toTitleCase(r.name),
        province: r.provinceName || '',
        isHub: ['3171', '3174', '3273', '3578', '5171'].includes(r.id),
      }))
      return {
        status: 'success',
        data: cities,
        message: 'Daftar kota berhasil diambil dari server.',
      }
    }
    return {
      status: 'success',
      data: [],
      message: 'Tidak ada kota ditemukan',
    }
  }
}
