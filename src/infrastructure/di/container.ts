import type { App } from 'vue'
import { TOKENS } from './tokens'
import { MockProductRepository } from '../repositories/MockProductRepository'
import { LocalStorageCartRepository } from '../repositories/LocalStorageCartRepository'
import { GetProductsUseCase } from '@/application/use-cases/GetProductsUseCase'
import { CalculateRentalPriceUseCase } from '@/application/use-cases/CalculateRentalPriceUseCase'
import { ManageCartUseCase } from '@/application/use-cases/ManageCartUseCase'

/**
 * Dependency Injection Container
 * Registers singletons and provides dependencies to the Vue application
 */
export class DIContainer {
  private static _productRepository = new MockProductRepository()
  private static _cartRepository = new LocalStorageCartRepository()
  private static _calculatorUseCase = new CalculateRentalPriceUseCase()
  private static _getProductsUseCase = new GetProductsUseCase(this._productRepository)
  private static _manageCartUseCase = new ManageCartUseCase(
    this._cartRepository,
    this._productRepository,
    this._calculatorUseCase
  )

  public static get productRepository() {
    return this._productRepository
  }

  public static get cartRepository() {
    return this._cartRepository
  }

  public static get calculatorUseCase() {
    return this._calculatorUseCase
  }

  public static get getProductsUseCase() {
    return this._getProductsUseCase
  }

  public static get manageCartUseCase() {
    return this._manageCartUseCase
  }

  public static install(app: App): void {
    app.provide(TOKENS.PRODUCT_REPOSITORY, this._productRepository)
    app.provide(TOKENS.CART_REPOSITORY, this._cartRepository)
    app.provide(TOKENS.GET_PRODUCTS_USE_CASE, this._getProductsUseCase)
    app.provide(TOKENS.CALCULATE_RENTAL_PRICE_USE_CASE, this._calculatorUseCase)
    app.provide(TOKENS.MANAGE_CART_USE_CASE, this._manageCartUseCase)
  }
}
