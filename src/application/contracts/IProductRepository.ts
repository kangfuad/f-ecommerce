import { Product } from '@/domain/entities/Product'
import { ProductCategory } from '@/domain/enums/ProductCategory'

export interface ProductFilterParams {
  category?: ProductCategory
  searchQuery?: string
  minPrice?: number
  maxPrice?: number
  onlyFeatured?: boolean
  onlyPopular?: boolean
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating'
}

export interface IProductRepository {
  getAll(filter?: ProductFilterParams): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  getFeatured(): Promise<Product[]>
  getPopular(): Promise<Product[]>
  getByCategory(category: ProductCategory): Promise<Product[]>
}
