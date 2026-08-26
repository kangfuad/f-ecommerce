import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'
import type { ProductRawDto } from './ProductService'

export interface CartItemDto {
  id: string
  userId?: string
  productId: string
  product?: ProductRawDto
  quantity: number
  rentalDays: number
  startDate: string
  endDate: string
  dailyRate?: number
  depositRate?: number
  totalAmount?: number
  createdAt?: string
  updatedAt?: string
}

export interface AddToCartDto {
  productId: string
  quantity: number
  startDate: string
  endDate: string
}

export interface UpdateCartItemDto {
  quantity?: number
  startDate?: string
  endDate?: string
}

export class CartService {
  /**
   * Fetch current user's cart strictly from Database API
   */
  public static async getCart(): Promise<ApiResponse<CartItemDto[]>> {
    const realRes = await apiClient.get<CartItemDto[]>(API_ENDPOINTS.CART.GET_CART)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      return realRes
    }
    return {
      status: 'success',
      data: [],
      message: 'Keranjang kosong',
    }
  }

  /**
   * Add new item to database cart
   */
  public static async addItem(dto: AddToCartDto): Promise<ApiResponse<CartItemDto>> {
    return apiClient.post<CartItemDto>(API_ENDPOINTS.CART.ADD_ITEM, dto)
  }

  /**
   * Update item quantity or rental dates in database cart
   */
  public static async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<ApiResponse<CartItemDto>> {
    return apiClient.put<CartItemDto>(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), dto)
  }

  /**
   * Remove item from database cart
   */
  public static async removeItem(itemId: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient.delete<{ id: string }>(API_ENDPOINTS.CART.REMOVE_ITEM(itemId))
  }

  /**
   * Clear all items from user's database cart
   */
  public static async clearCart(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.CART.CLEAR_CART)
  }
}
