import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'
import type { ProductCategory } from '@/domain/enums/ProductCategory'
import type { RentalStatus } from '@/domain/enums/RentalStatus'
import type { ItemCondition } from '@/domain/enums/ItemCondition'

export interface ProductRawDto {
  id: string
  name: string
  category: ProductCategory
  dailyRate: number
  marketValue: number
  depositAmount: number
  images: string[]
  description: string
  specs: Record<string, string>
  includedItems: string[]
  status: RentalStatus
  condition: ItemCondition
  rating: number
  reviewCount: number
  location: string
  isFeatured?: boolean
  isPopular?: boolean
  badgeText?: string
}

export class ProductService {
  private static cachedProducts: ProductRawDto[] | null = null

  public static async getProducts(): Promise<ApiResponse<ProductRawDto[]>> {
    if (this.cachedProducts) {
      return {
        status: 'success',
        data: this.cachedProducts,
        message: 'Products retrieved from cache',
      }
    }

    const response = await apiClient.get<ProductRawDto[]>('/data/products.json')
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.cachedProducts = response.data
    }
    return response
  }

  public static async getProductById(id: string): Promise<ApiResponse<ProductRawDto | null>> {
    const productsResponse = await this.getProducts()
    if (productsResponse.status === 'success') {
      const found = productsResponse.data.find((p) => p.id === id) || null
      return {
        status: 'success',
        data: found,
        message: found ? `Product ${id} retrieved successfully!` : `Product ${id} not found`,
      }
    }
    return {
      status: 'error',
      data: null,
      message: productsResponse.message,
    }
  }
}
