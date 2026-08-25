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
    if (res && Array.isArray(res.data)) {
      this.cachedProvinces = res.data
      return { status: 'success', data: res.data, message: 'Provinces retrieved' }
    }
    return { status: 'error', data: [], message: res?.message || 'Gagal memuat provinsi' }
  }

  public static async getRegencies(provinceId?: string): Promise<ApiResponse<RegencyDto[]>> {
    if (!this.cachedRegencies) {
      const res: any = await apiClient.get<RegencyDto[]>('/data/master-wilayah/regencies.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedRegencies = res.data
      } else if (Array.isArray(res)) {
        this.cachedRegencies = res
      } else if (res && Array.isArray(res.data)) {
        this.cachedRegencies = res.data
      } else {
        return { status: 'error', data: [], message: res?.message || 'Gagal memuat kabupaten/kota' }
      }
    }

    const list = this.cachedRegencies || []
    const filtered = provinceId
      ? list.filter((r) => String(r.province_id) === String(provinceId))
      : list

    return { status: 'success', data: filtered, message: 'Regencies retrieved' }
  }

  public static async getDistricts(regencyId?: string): Promise<ApiResponse<DistrictDto[]>> {
    if (!this.cachedDistricts) {
      const res: any = await apiClient.get<DistrictDto[]>('/data/master-wilayah/districts.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedDistricts = res.data
      } else if (Array.isArray(res)) {
        this.cachedDistricts = res
      } else if (res && Array.isArray(res.data)) {
        this.cachedDistricts = res.data
      } else {
        return { status: 'error', data: [], message: res?.message || 'Gagal memuat kecamatan' }
      }
    }

    const list = this.cachedDistricts || []
    const filtered = regencyId
      ? list.filter((d) => String(d.regency_id) === String(regencyId))
      : list

    return { status: 'success', data: filtered, message: 'Districts retrieved' }
  }

  public static async getVillages(districtId?: string): Promise<ApiResponse<VillageDto[]>> {
    if (!this.cachedVillages) {
      const res: any = await apiClient.get<VillageDto[]>('/data/master-wilayah/villages.json')
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.cachedVillages = res.data
      } else if (Array.isArray(res)) {
        this.cachedVillages = res
      } else if (res && Array.isArray(res.data)) {
        this.cachedVillages = res.data
      } else {
        return { status: 'error', data: [], message: res?.message || 'Gagal memuat desa/kelurahan' }
      }
    }

    const list = this.cachedVillages || []
    const filtered = districtId
      ? list.filter((v) => String(v.district_id) === String(districtId))
      : list

    return { status: 'success', data: filtered, message: 'Villages retrieved' }
  }
}
