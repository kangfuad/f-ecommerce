import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'

export interface ProvinceDto {
  id: string
  name: string
  alt_name?: string
  altName?: string
  latitude?: number
  longitude?: number
}

export interface RegencyDto {
  id: string
  province_id?: string
  provinceId?: string
  parentId?: string
  name: string
  alt_name?: string
  altName?: string
  latitude?: number
  longitude?: number
}

export interface DistrictDto {
  id: string
  regency_id?: string
  regencyId?: string
  parentId?: string
  name: string
  alt_name?: string
  altName?: string
  latitude?: number
  longitude?: number
}

export interface VillageDto {
  id: string
  district_id?: string
  districtId?: string
  parentId?: string
  name: string
  latitude?: number | null
  longitude?: number | null
}

export function toTitleCase(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export class RegionService {
  public static async getProvinces(search?: string): Promise<ApiResponse<ProvinceDto[]>> {
    const query = search ? ('?search=' + encodeURIComponent(search)) : ''
    return apiClient.get<ProvinceDto[]>(`${API_ENDPOINTS.REGIONS.PROVINCES}${query}`)
  }

  public static async getRegencies(provinceId?: string, search?: string): Promise<ApiResponse<RegencyDto[]>> {
    let endpoint: string = API_ENDPOINTS.REGIONS.REGENCIES
    if (provinceId) {
      endpoint = API_ENDPOINTS.REGIONS.REGENCIES_BY_PROVINCE(provinceId)
    }
    const query = search ? ('?search=' + encodeURIComponent(search)) : ''
    return apiClient.get<RegencyDto[]>(`${endpoint}${query}`)
  }

  public static async getDistricts(regencyId?: string, search?: string): Promise<ApiResponse<DistrictDto[]>> {
    let endpoint: string = API_ENDPOINTS.REGIONS.DISTRICTS
    if (regencyId) {
      endpoint = API_ENDPOINTS.REGIONS.DISTRICTS_BY_REGENCY(regencyId)
    }
    const query = search ? ('?search=' + encodeURIComponent(search)) : ''
    return apiClient.get<DistrictDto[]>(`${endpoint}${query}`)
  }

  public static async getVillages(districtId?: string, search?: string): Promise<ApiResponse<VillageDto[]>> {
    let endpoint: string = API_ENDPOINTS.REGIONS.VILLAGES
    if (districtId) {
      endpoint = API_ENDPOINTS.REGIONS.VILLAGES_BY_DISTRICT(districtId)
    }
    const query = search ? ('?search=' + encodeURIComponent(search)) : ''
    return apiClient.get<VillageDto[]>(`${endpoint}${query}`)
  }
}
