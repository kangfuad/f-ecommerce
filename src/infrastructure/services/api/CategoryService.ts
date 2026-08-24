import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'

export interface CategoryDto {
  id: string
  label: string
  icon: string
  badge?: string
  description?: string
}

export class CategoryService {
  private static cachedCategories: CategoryDto[] | null = null

  public static async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    if (this.cachedCategories) {
      return {
        status: 'success',
        data: this.cachedCategories,
        message: 'Categories retrieved from cache',
      }
    }

    const response = await apiClient.get<CategoryDto[]>('/data/categories.json')
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.cachedCategories = response.data
    }
    return response
  }

  public static async getCategoryById(id: string): Promise<ApiResponse<CategoryDto | null>> {
    const categoriesResponse = await this.getCategories()
    if (categoriesResponse.status === 'success') {
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
