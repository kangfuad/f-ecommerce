import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'

export interface ProvinceDto {
  id: string
  name: string
  alt_name?: string
  latitude?: number
  longitude?: number
}

export interface RegencyDto {
  id: string
  province_id: string
  name: string
  alt_name?: string
  latitude?: number
  longitude?: number
}

export interface DistrictDto {
  id: string
  regency_id: string
  name: string
  alt_name?: string
  latitude?: number
  longitude?: number
}

export interface VillageDto {
  id: string
  district_id: string
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
  private static cachedProvinces: ProvinceDto[] | null = null
  private static cachedRegencies: RegencyDto[] | null = null
  private static cachedDistricts: DistrictDto[] | null = null
  private static cachedVillages: VillageDto[] | null = null

  public static async getProvinces(): Promise<ApiResponse<ProvinceDto[]>> {
    if (this.cachedProvinces) {
      return { status: 'success', data: this.cachedProvinces, message: 'Provinces from cache' }
    }
    const res = await apiClient.get<ProvinceDto[]>('/data/master-wilayah/provinces.json')
    if (res.status === 'success' && Array.isArray(res.data)) {
      this.cachedProvinces = res.data
    }
    return res
  }

  public static async getRegencies(provinceId?: string): Promise<ApiResponse<RegencyDto[]>> {
    if (!this.cachedRegencies) {
      const res = await apiClient.get<RegencyDto[]>('/data/master-wilayah/regencies.json')
      if (res.status === 'success' && Array.isArray(res.data)) {
        this.cachedRegencies = res.data
      } else {
        return res
      }
    }

    const filtered = provinceId
      ? this.cachedRegencies.filter((r) => r.province_id === provinceId)
      : this.cachedRegencies

    return { status: 'success', data: filtered, message: 'Regencies retrieved' }
  }

  public static async getDistricts(regencyId?: string): Promise<ApiResponse<DistrictDto[]>> {
    if (!this.cachedDistricts) {
      const res = await apiClient.get<DistrictDto[]>('/data/master-wilayah/districts.json')
      if (res.status === 'success' && Array.isArray(res.data)) {
        this.cachedDistricts = res.data
      } else {
        return res
      }
    }

    const filtered = regencyId
      ? this.cachedDistricts.filter((d) => d.regency_id === regencyId)
      : this.cachedDistricts

    return { status: 'success', data: filtered, message: 'Districts retrieved' }
  }

  public static async getVillages(districtId?: string): Promise<ApiResponse<VillageDto[]>> {
    if (!this.cachedVillages) {
      const res = await apiClient.get<VillageDto[]>('/data/master-wilayah/villages.json')
      if (res.status === 'success' && Array.isArray(res.data)) {
        this.cachedVillages = res.data
      } else {
        return res
      }
    }

    const filtered = districtId
      ? this.cachedVillages.filter((v) => v.district_id === districtId)
      : this.cachedVillages

    return { status: 'success', data: filtered, message: 'Villages retrieved' }
  }
}
