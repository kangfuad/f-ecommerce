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

const LOCAL_CART_STORAGE_KEY = 'epunyasewa_cart_items_v2'

export class CartService {
  /**
   * Fetch current user's cart from Database API (fallback to local state)
   */
  public static async getCart(): Promise<ApiResponse<CartItemDto[]>> {
    // 1. Try real Database API
    const realRes = await apiClient.get<CartItemDto[]>(API_ENDPOINTS.CART.GET_CART)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      this.saveCartLocally(realRes.data)
      return realRes
    }

    // 2. Fallback to local storage
    const localItems = this.getCartFromLocal()
    return {
      status: 'success',
      data: localItems,
      message: 'Cart retrieved from local storage',
    }
  }

  /**
   * Add new item to database cart
   */
  public static async addItem(dto: AddToCartDto): Promise<ApiResponse<CartItemDto>> {
    // 1. Try real Database API
    const realRes = await apiClient.post<CartItemDto>(API_ENDPOINTS.CART.ADD_ITEM, dto)
    if (realRes.status === 'success' && realRes.data) {
      const current = this.getCartFromLocal()
      const existingIdx = current.findIndex((i) => i.id === realRes.data.id || i.productId === dto.productId)
      if (existingIdx >= 0) {
        current[existingIdx] = realRes.data
      } else {
        current.push(realRes.data)
      }
      this.saveCartLocally(current)
      return realRes
    }

    // 2. Fallback to local item creation
    const start = new Date(dto.startDate)
    const end = new Date(dto.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    const fallbackItem: CartItemDto = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: dto.productId,
      quantity: dto.quantity,
      startDate: dto.startDate,
      endDate: dto.endDate,
      rentalDays,
      createdAt: new Date().toISOString(),
    }

    const current = this.getCartFromLocal()
    const existingIdx = current.findIndex((i) => i.productId === dto.productId)
    if (existingIdx >= 0) {
      current[existingIdx].quantity += dto.quantity
      current[existingIdx].startDate = dto.startDate
      current[existingIdx].endDate = dto.endDate
      current[existingIdx].rentalDays = rentalDays
    } else {
      current.push(fallbackItem)
    }
    this.saveCartLocally(current)

    return {
      status: 'success',
      data: existingIdx >= 0 ? current[existingIdx] : fallbackItem,
      message: 'Item berhasil ditambahkan ke keranjang.',
    }
  }

  /**
   * Update item quantity or rental dates in database cart
   */
  public static async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<ApiResponse<CartItemDto>> {
    // 1. Try real Database API
    const realRes = await apiClient.put<CartItemDto>(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), dto)
    if (realRes.status === 'success' && realRes.data) {
      const current = this.getCartFromLocal()
      const idx = current.findIndex((i) => i.id === itemId)
      if (idx >= 0) {
        current[idx] = realRes.data
        this.saveCartLocally(current)
      }
      return realRes
    }

    // 2. Fallback local update
    const current = this.getCartFromLocal()
    const idx = current.findIndex((i) => i.id === itemId)
    if (idx >= 0) {
      if (dto.quantity !== undefined) current[idx].quantity = dto.quantity
      if (dto.startDate !== undefined) current[idx].startDate = dto.startDate
      if (dto.endDate !== undefined) current[idx].endDate = dto.endDate
      if (dto.startDate && dto.endDate) {
        const start = new Date(dto.startDate)
        const end = new Date(dto.endDate)
        current[idx].rentalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
      }
      this.saveCartLocally(current)
      return {
        status: 'success',
        data: current[idx],
        message: 'Item keranjang berhasil diperbarui.',
      }
    }

    return {
      status: 'error',
      data: null as any,
      message: 'Item tidak ditemukan di keranjang.',
    }
  }

  /**
   * Remove item from database cart
   */
  public static async removeItem(itemId: string): Promise<ApiResponse<{ id: string }>> {
    // 1. Try real Database API
    const realRes = await apiClient.delete<{ id: string }>(API_ENDPOINTS.CART.REMOVE_ITEM(itemId))
    if (realRes.status === 'success') {
      const current = this.getCartFromLocal().filter((i) => i.id !== itemId)
      this.saveCartLocally(current)
      return realRes
    }

    // 2. Fallback local delete
    const current = this.getCartFromLocal().filter((i) => i.id !== itemId)
    this.saveCartLocally(current)
    return {
      status: 'success',
      data: { id: itemId },
      message: 'Item berhasil dihapus dari keranjang.',
    }
  }

  /**
   * Clear all items from user's database cart
   */
  public static async clearCart(): Promise<ApiResponse<void>> {
    // 1. Try real Database API
    await apiClient.delete<void>(API_ENDPOINTS.CART.CLEAR_CART)
    // 2. Clear local storage
    this.saveCartLocally([])
    return {
      status: 'success',
      data: undefined as any,
      message: 'Keranjang berhasil dikosongkan.',
    }
  }

  private static getCartFromLocal(): CartItemDto[] {
    if (typeof localStorage === 'undefined') return []
    try {
      const raw = localStorage.getItem(LOCAL_CART_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private static saveCartLocally(items: CartItemDto[]) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('[CartService.saveCartLocally] Failed to write localStorage:', e)
    }
  }
}
