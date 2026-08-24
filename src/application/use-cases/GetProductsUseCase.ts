import type { IProductRepository, ProductFilterParams } from '../contracts/IProductRepository'
import { Product } from '@/domain/entities/Product'
import { NotFoundException } from '@/core/errors/NotFoundException'

/**
 * GetProductsUseCase
 * Single Responsibility: Retrieving and filtering product catalog
 */
export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(filter?: ProductFilterParams): Promise<Product[]> {
    return this.productRepository.getAll(filter)
  }

  public async getFeatured(): Promise<Product[]> {
    return this.productRepository.getFeatured()
  }

  public async getPopular(): Promise<Product[]> {
    return this.productRepository.getPopular()
  }

  public async getById(id: string): Promise<Product> {
    const product = await this.productRepository.getById(id)
    if (!product) {
      throw new NotFoundException('Barang sewa', id)
    }
    return product
  }
}
