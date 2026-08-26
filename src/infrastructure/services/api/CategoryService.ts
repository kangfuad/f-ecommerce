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
    // 1. Try real API
    const realRes = await apiClient.get<CategoryDto[]>(API_ENDPOINTS.CATEGORIES.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      return {
        status: 'success',
        data: realRes.data.map((c) => ({
          ...c,
          label: c.label || c.name || c.id,
        })),
        message: 'Categories retrieved successfully from API',
      }
    }

    return apiClient.get<CategoryDto[]>(API_ENDPOINTS.LOCAL_MOCKS.CATEGORIES)
  }

  public static async getCategoryById(id: string): Promise<ApiResponse<CategoryDto | null>> {
    const categoriesResponse = await this.getCategories()
    if (categoriesResponse.status === 'success' && Array.isArray(categoriesResponse.data)) {
      const found = categoriesResponse.data.find((c) => c.id === id) || null
      return {
        status: 'success',
        data: found,
        message: found ? `Category ${id} found` : `Category ${id} not found`,
      }
    }
    return {
      status: 'error',
      data: null,
      message: categoriesResponse.message,
    }
  }
}
