import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'
import type { ProductCategory } from '@/domain/enums/ProductCategory'
import type { RentalStatus } from '@/domain/enums/RentalStatus'
import type { ItemCondition } from '@/domain/enums/ItemCondition'

export interface ProductRawDto {
  id: string
  name: string
  category: ProductCategory
  dailyRate: number
  marketValue?: number
  depositAmount: number
  images: string[]
  primaryImage?: string
  description: string
  specs?: Record<string, string>
  includedItems: string[]
  status?: RentalStatus
  condition: ItemCondition
  rating: number
  reviewCount: number
  location: string
  isFeatured?: boolean
  isPopular?: boolean
  badgeText?: string
  stockAvailable?: number
  provider?: {
    id: string
    name: string
    phone?: string
    rating?: number
    isVerified?: boolean
  }
}

export interface ProductFilterQuery {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  location?: string
  sortBy?: string
  page?: number
  limit?: number
}

export class ProductService {
  public static async getProducts(filter?: ProductFilterQuery): Promise<ApiResponse<ProductRawDto[]>> {
    let queryStr = ''
    if (filter) {
      const params = new URLSearchParams()
      if (filter.category) params.append('category', filter.category)
      if (filter.search) params.append('search', filter.search)
      if (filter.minPrice !== undefined) params.append('minPrice', String(filter.minPrice))
      if (filter.maxPrice !== undefined) params.append('maxPrice', String(filter.maxPrice))
      if (filter.condition) params.append('condition', filter.condition)
      if (filter.location) params.append('location', filter.location)
      if (filter.sortBy) params.append('sortBy', filter.sortBy)
      if (filter.page) params.append('page', String(filter.page))
      if (filter.limit) params.append('limit', String(filter.limit))
      queryStr = `?${params.toString()}`
    }

    return apiClient.get<ProductRawDto[]>(`${API_ENDPOINTS.PRODUCTS.LIST}${queryStr}`)
  }

  public static async getProductById(idOrSlug: string): Promise<ApiResponse<ProductRawDto | null>> {
    return apiClient.get<ProductRawDto>(API_ENDPOINTS.PRODUCTS.DETAIL(idOrSlug))
  }
}
