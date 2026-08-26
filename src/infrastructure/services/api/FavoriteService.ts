import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'
import type { ProductRawDto } from './ProductService'

export interface FavoriteItemDto {
  id: string
  userId?: string
  productId: string
  product?: ProductRawDto
  createdAt?: string
}

export interface ToggleFavoriteResultDto {
  isFavorited: boolean
  productId: string
}

export class FavoriteService {
  /**
   * Fetch user's favorites strictly from Database API
   */
  public static async getFavorites(): Promise<ApiResponse<FavoriteItemDto[]>> {
    const realRes = await apiClient.get<FavoriteItemDto[]>(API_ENDPOINTS.FAVORITES.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      return realRes
    }
    return {
      status: 'success',
      data: [],
      message: 'Daftar favorit kosong',
    }
  }

  /**
   * Toggle product in user's favorites list (Database API)
   */
  public static async toggleFavorite(productId: string): Promise<ApiResponse<ToggleFavoriteResultDto>> {
    return apiClient.post<ToggleFavoriteResultDto>(API_ENDPOINTS.FAVORITES.TOGGLE, { productId })
  }

  /**
   * Remove product from favorites
   */
  public static async removeFavorite(productId: string): Promise<ApiResponse<{ productId: string }>> {
    return apiClient.delete<{ productId: string }>(API_ENDPOINTS.FAVORITES.REMOVE(productId))
  }
}
