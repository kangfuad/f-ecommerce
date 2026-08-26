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
  province_id?: string
  provinceId?: string
  name: string
  alt_name?: string
  latitude?: number
  longitude?: number
}

export interface DistrictDto {
  id: string
  regency_id?: string
  regencyId?: string
  name: string
  alt_name?: string
  latitude?: number
  longitude?: number
}

export interface VillageDto {
  id: string
  district_id?: string
  districtId?: string
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

  public static async getProvinces(search?: string): Promise<ApiResponse<ProvinceDto[]>> {
    // 1. Try real API
    const realRes = await apiClient.get<ProvinceDto[]>(`/regions/provinces${search ? `?search=${encodeURIComponent(search)}` : ''}`)
    if (realRes.status === 'success' && Array.isArray(realRes.data) && realRes.data.length > 0) {
      return realRes
    }

    // 2. Fallback to local master-wilayah
    if (this.cachedProvinces && this.cachedProvinces.length > 0) {
      return { status: 'success', data: this.cachedProvinces, message: 'Provinces from cache' }
    }
    const res: any = await apiClient.get<ProvinceDto[]>('/data/master-wilayah/provinces.json')
    if (res && res.status === 'success' && Array.isArray(res.data)) {
      this.cachedProvinces = res.data
      return res
    }
    if (Array.isArray(res)) {
      this.cachedProvinces = res
      return { status: 'success', data: res, message: 'Provinces retrieved' }
    }
    return { status: 'error', data: [], message: res?.message || 'Gagal memuat provinsi' }
  }

  public static async getRegencies(provinceId?: string, search?: string): Promise<ApiResponse<RegencyDto[]>> {
    // 1. Try real API
    if (provinceId) {
      const realRes = await apiClient.get<RegencyDto[]>(`/regions/provinces/${provinceId}/regencies${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      if (realRes.status === 'success' && Array.isArray(realRes.data) && realRes.data.length > 0) {
        return realRes
      }
    }

    // 2. Fallback to local
    if (!this.cachedRegencies) {
      const res: any = await apiClient.get<RegencyDto[]>('/data/master-wilayah/regencies.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedRegencies = res.data
      } else if (Array.isArray(res)) {
        this.cachedRegencies = res
      }
    }

    const list = this.cachedRegencies || []
    const filtered = provinceId
      ? list.filter((r) => String(r.province_id || r.provinceId) === String(provinceId))
      : list

    return { status: 'success', data: filtered, message: 'Regencies retrieved' }
  }

  public static async getDistricts(regencyId?: string, search?: string): Promise<ApiResponse<DistrictDto[]>> {
    // 1. Try real API
    if (regencyId) {
      const realRes = await apiClient.get<DistrictDto[]>(`/regions/regencies/${regencyId}/districts${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      if (realRes.status === 'success' && Array.isArray(realRes.data) && realRes.data.length > 0) {
        return realRes
      }
    }

    // 2. Fallback to local
    if (!this.cachedDistricts) {
      const res: any = await apiClient.get<DistrictDto[]>('/data/master-wilayah/districts.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedDistricts = res.data
      } else if (Array.isArray(res)) {
        this.cachedDistricts = res
      }
    }

    const list = this.cachedDistricts || []
    const filtered = regencyId
      ? list.filter((d) => String(d.regency_id || d.regencyId) === String(regencyId))
      : list

    return { status: 'success', data: filtered, message: 'Districts retrieved' }
  }

  public static async getVillages(districtId?: string, search?: string): Promise<ApiResponse<VillageDto[]>> {
    // 1. Try real API
    if (districtId) {
      const realRes = await apiClient.get<VillageDto[]>(`/regions/districts/${districtId}/villages${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      if (realRes.status === 'success' && Array.isArray(realRes.data) && realRes.data.length > 0) {
        return realRes
      }
    }

    // 2. Fallback to local
    if (!this.cachedVillages) {
      const res: any = await apiClient.get<VillageDto[]>('/data/master-wilayah/villages.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedVillages = res.data
      } else if (Array.isArray(res)) {
        this.cachedVillages = res
      }
    }

    const list = this.cachedVillages || []
    const filtered = districtId
      ? list.filter((v) => String(v.district_id || v.districtId) === String(districtId))
      : list

    return { status: 'success', data: filtered, message: 'Villages retrieved' }
  }
}
