import { Product } from '@/domain/entities/Product'
import { ProductCategory } from '@/domain/enums/ProductCategory'
import { RentalStatus } from '@/domain/enums/RentalStatus'
import { ItemCondition } from '@/domain/enums/ItemCondition'
import type { IProductRepository, ProductFilterParams } from '@/application/contracts/IProductRepository'
import { ProductService, type ProductRawDto } from '../services/api/ProductService'

export class MockProductRepository implements IProductRepository {
  private async fetchProducts(): Promise<Product[]> {
    try {
      const response = await ProductService.getProducts()
      if (response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(
          (raw: ProductRawDto) =>
            new Product({
              id: raw.id,
              name: raw.name,
              category: raw.category,
              dailyRate: raw.dailyRate,
              marketValue: raw.marketValue || raw.dailyRate * 10,
              depositAmount: raw.depositAmount || 0,
              images: raw.images && raw.images.length > 0 ? raw.images : (raw.primaryImage ? [raw.primaryImage] : []),
              description: raw.description,
              specs: raw.specs || {},
              includedItems: raw.includedItems || [],
              status: raw.status || RentalStatus.AVAILABLE,
              condition: raw.condition || ItemCondition.LIKE_NEW,
              rating: raw.rating || 5.0,
              reviewCount: raw.reviewCount || 0,
              location: raw.location || 'Indonesia',
              isFeatured: raw.isFeatured,
              isPopular: raw.isPopular,
              badgeText: raw.badgeText,
            })
        )
      }
    } catch (e) {
      console.warn('[ProductRepository.fetchProducts] Error:', e)
    }

    return []
  }

  public async getAll(filter?: ProductFilterParams): Promise<Product[]> {
    const products = await this.fetchProducts()
    let result = [...products]

    if (filter?.category && filter.category !== ProductCategory.ALL) {
      result = result.filter((p) => p.category === filter.category)
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    }

    if (filter?.minPrice !== undefined) {
      result = result.filter((p) => p.dailyRate.amount >= filter.minPrice!)
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter((p) => p.dailyRate.amount <= filter.maxPrice!)
    }

    if (filter?.onlyFeatured) {
      result = result.filter((p) => p.isFeatured)
    }

    if (filter?.onlyPopular) {
      result = result.filter((p) => p.isPopular)
    }

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.dailyRate.amount - b.dailyRate.amount)
          break
        case 'price_desc':
          result.sort((a, b) => b.dailyRate.amount - a.dailyRate.amount)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
        case 'popular':
        default:
          result.sort((a, b) => b.reviewCount - a.reviewCount)
          break
      }
    }

    return result
  }

  public async getById(id: string): Promise<Product | null> {
    try {
      const res = await ProductService.getProductById(id)
      if (res.status === 'success' && res.data) {
        const raw = res.data
        return new Product({
          id: raw.id,
          name: raw.name,
          category: raw.category,
          dailyRate: raw.dailyRate,
          marketValue: raw.marketValue || raw.dailyRate * 10,
          depositAmount: raw.depositAmount || 0,
          images: raw.images && raw.images.length > 0 ? raw.images : (raw.primaryImage ? [raw.primaryImage] : []),
          description: raw.description,
          specs: raw.specs || {},
          includedItems: raw.includedItems || [],
          status: raw.status || RentalStatus.AVAILABLE,
          condition: raw.condition || ItemCondition.LIKE_NEW,
          rating: raw.rating || 5.0,
          reviewCount: raw.reviewCount || 0,
          location: raw.location || 'Indonesia',
          isFeatured: raw.isFeatured,
          isPopular: raw.isPopular,
          badgeText: raw.badgeText,
        })
      }
    } catch (e) {
      console.warn('[ProductRepository.getById] Error:', e)
    }
    return null
  }

  public async getFeatured(): Promise<Product[]> {
    const products = await this.fetchProducts()
    return products.filter((p) => p.isFeatured)
  }

  public async getPopular(): Promise<Product[]> {
    const products = await this.fetchProducts()
    return products.filter((p) => p.isPopular)
  }

  public async getByCategory(category: ProductCategory): Promise<Product[]> {
    const products = await this.fetchProducts()
    if (category === ProductCategory.ALL) return products
    return products.filter((p) => p.category === category)
  }
}
