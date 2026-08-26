import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'

export interface CategoryDto {
  id: string
  code?: string
  name?: string
  label: string
  icon: string
  badge?: string
  description?: string
}

export class CategoryService {
  public static async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    const realRes = await apiClient.get<CategoryDto[]>(API_ENDPOINTS.CATEGORIES.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      return {
        status: 'success',
        data: realRes.data.map((c) => ({
          ...c,
          label: c.label || c.name || c.id,
        })),
        message: 'Daftar kategori berhasil diambil.',
      }
    }
    return realRes
  }

  public static async getCategoryById(id: string): Promise<ApiResponse<CategoryDto | null>> {
    const realRes = await apiClient.get<CategoryDto>(API_ENDPOINTS.CATEGORIES.DETAIL(id))
    if (realRes.status === 'success' && realRes.data) {
      return realRes
    }
    return {
      status: 'error',
      data: null,
      message: realRes.message || ('Category ' + id + ' not found'),
    }
  }
}
