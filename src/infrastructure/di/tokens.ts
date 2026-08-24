import type { InjectionKey } from 'vue'
import type { IProductRepository } from '@/application/contracts/IProductRepository'
import type { ICartRepository } from '@/application/contracts/ICartRepository'
import { GetProductsUseCase } from '@/application/use-cases/GetProductsUseCase'
import { CalculateRentalPriceUseCase } from '@/application/use-cases/CalculateRentalPriceUseCase'
import { ManageCartUseCase } from '@/application/use-cases/ManageCartUseCase'

export const TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository') as InjectionKey<IProductRepository>,
  CART_REPOSITORY: Symbol('ICartRepository') as InjectionKey<ICartRepository>,
  GET_PRODUCTS_USE_CASE: Symbol('GetProductsUseCase') as InjectionKey<GetProductsUseCase>,
  CALCULATE_RENTAL_PRICE_USE_CASE: Symbol('CalculateRentalPriceUseCase') as InjectionKey<CalculateRentalPriceUseCase>,
  MANAGE_CART_USE_CASE: Symbol('ManageCartUseCase') as InjectionKey<ManageCartUseCase>,
}
