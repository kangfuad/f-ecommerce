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

const LOCAL_WISHLIST_STORAGE_KEY = 'epunyasewa_wishlist_ids_v2'

export class FavoriteService {
  /**
   * Fetch user's favorites from Database API
   */
  public static async getFavorites(): Promise<ApiResponse<FavoriteItemDto[]>> {
    // 1. Try real Database API
    const realRes = await apiClient.get<FavoriteItemDto[]>(API_ENDPOINTS.FAVORITES.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      const ids = realRes.data.map((f) => f.productId)
      this.saveLocalIds(ids)
      return realRes
    }

    // 2. Fallback to local
    const ids = this.getLocalIds()
    const mapped: FavoriteItemDto[] = ids.map((id) => ({
      id: `fav_${id}`,
      productId: id,
      createdAt: new Date().toISOString(),
    }))

    return {
      status: 'success',
      data: mapped,
      message: 'Favorites retrieved from local storage',
    }
  }

  /**
   * Toggle product in user's favorites list (Database API)
   */
  public static async toggleFavorite(productId: string): Promise<ApiResponse<ToggleFavoriteResultDto>> {
    // 1. Try real Database API
    const realRes = await apiClient.post<ToggleFavoriteResultDto>(API_ENDPOINTS.FAVORITES.TOGGLE, { productId })
    if (realRes.status === 'success' && realRes.data) {
      const ids = this.getLocalIds()
      if (realRes.data.isFavorited) {
        if (!ids.includes(productId)) ids.push(productId)
      } else {
        const idx = ids.indexOf(productId)
        if (idx > -1) ids.splice(idx, 1)
      }
      this.saveLocalIds(ids)
      return realRes
    }

    // 2. Fallback local toggle
    const ids = this.getLocalIds()
    const index = ids.indexOf(productId)
    let isFavorited = false

    if (index > -1) {
      ids.splice(index, 1)
      isFavorited = false
    } else {
      ids.push(productId)
      isFavorited = true
    }

    this.saveLocalIds(ids)

    return {
      status: 'success',
      data: { isFavorited, productId },
      message: isFavorited ? 'Unit berhasil ditambahkan ke favorit.' : 'Unit dihapus dari favorit.',
    }
  }

  /**
   * Remove product from favorites
   */
  public static async removeFavorite(productId: string): Promise<ApiResponse<{ productId: string }>> {
    // 1. Try real Database API
    const realRes = await apiClient.delete<{ productId: string }>(API_ENDPOINTS.FAVORITES.REMOVE(productId))
    if (realRes.status === 'success') {
      const ids = this.getLocalIds().filter((id) => id !== productId)
      this.saveLocalIds(ids)
      return realRes
    }

    // 2. Fallback local
    const ids = this.getLocalIds().filter((id) => id !== productId)
    this.saveLocalIds(ids)
    return {
      status: 'success',
      data: { productId },
      message: 'Unit dihapus dari favorit.',
    }
  }

  public static getLocalIds(): string[] {
    if (typeof localStorage === 'undefined') return []
    try {
      const raw = localStorage.getItem(LOCAL_WISHLIST_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  public static saveLocalIds(ids: string[]) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(LOCAL_WISHLIST_STORAGE_KEY, JSON.stringify(ids))
    } catch (e) {
      console.warn('[FavoriteService.saveLocalIds] Failed to write localStorage:', e)
    }
  }
}
