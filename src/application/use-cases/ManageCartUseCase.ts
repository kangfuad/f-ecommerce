import type { ICartRepository, SerializedCartItem } from '../contracts/ICartRepository'
import type { IProductRepository } from '../contracts/IProductRepository'
import { CartItem } from '@/domain/entities/CartItem'
import { DateRange } from '@/domain/value-objects/DateRange'
import { CalculateRentalPriceUseCase } from './CalculateRentalPriceUseCase'
import { NotFoundException } from '@/core/errors/NotFoundException'

export interface AddToCartInput {
  productId: string
  startDate: Date | string
  endDate: Date | string
  quantity: number
  includeInsurance: boolean
}

/**
 * ManageCartUseCase
 * Single Responsibility: Cart business operations (add, remove, update, load)
 */
export class ManageCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly calculatorUseCase: CalculateRentalPriceUseCase
  ) {}

  public async getCartItems(): Promise<CartItem[]> {
    const serialized = await this.cartRepository.getCartItems()
    const cartItems: CartItem[] = []

    for (const item of serialized) {
      const product = await this.productRepository.getById(item.productId)
      if (product) {
        try {
          const dateRange = DateRange.create(item.startDate, item.endDate)
          cartItems.push(
            new CartItem({
              id: item.id,
              product,
              dateRange,
              quantity: item.quantity,
              includeInsurance: item.includeInsurance,
              createdAt: new Date(item.createdAt),
            })
          )
        } catch {
          // If date is corrupted or invalid, skip
        }
      }
    }

    return cartItems
  }

  public async addToCart(input: AddToCartInput): Promise<CartItem[]> {
    const product = await this.productRepository.getById(input.productId)
    if (!product) {
      throw new NotFoundException('Barang sewa', input.productId)
    }

    // Validate booking logic via calculator
    this.calculatorUseCase.execute({
      product,
      startDate: input.startDate,
      endDate: input.endDate,
      quantity: input.quantity,
      includeInsurance: input.includeInsurance,
    })

    const existingItems = await this.cartRepository.getCartItems()
    const startDateStr = typeof input.startDate === 'string' ? input.startDate : input.startDate.toISOString().split('T')[0]
    const endDateStr = typeof input.endDate === 'string' ? input.endDate : input.endDate.toISOString().split('T')[0]

    // Check if same item with same date range already in cart
    const existingIndex = existingItems.findIndex(
      (item) =>
        item.productId === input.productId &&
        item.startDate === startDateStr &&
        item.endDate === endDateStr
    )

    if (existingIndex > -1) {
      existingItems[existingIndex].quantity += input.quantity
    } else {
      const newItem: SerializedCartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: input.productId,
        startDate: startDateStr,
        endDate: endDateStr,
        quantity: input.quantity,
        includeInsurance: input.includeInsurance,
        createdAt: new Date().toISOString(),
      }
      existingItems.push(newItem)
    }

    await this.cartRepository.saveCartItems(existingItems)
    return this.getCartItems()
  }

  public async updateItemQuantity(cartItemId: string, newQuantity: number): Promise<CartItem[]> {
    const existingItems = await this.cartRepository.getCartItems()
    const itemIndex = existingItems.findIndex((item) => item.id === cartItemId)

    if (itemIndex === -1) {
      throw new NotFoundException('Item keranjang', cartItemId)
    }

    if (newQuantity <= 0) {
      existingItems.splice(itemIndex, 1)
    } else {
      existingItems[itemIndex].quantity = newQuantity
    }

    await this.cartRepository.saveCartItems(existingItems)
    return this.getCartItems()
  }

  public async updateItemDates(
    cartItemId: string,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<CartItem[]> {
    const existingItems = await this.cartRepository.getCartItems()
    const itemIndex = existingItems.findIndex((item) => item.id === cartItemId)

    if (itemIndex === -1) {
      throw new NotFoundException('Item keranjang', cartItemId)
    }

    const product = await this.productRepository.getById(existingItems[itemIndex].productId)
    if (!product) {
      throw new NotFoundException('Barang sewa', existingItems[itemIndex].productId)
    }

    // Validate new dates
    this.calculatorUseCase.execute({
      product,
      startDate,
      endDate,
      quantity: existingItems[itemIndex].quantity,
      includeInsurance: existingItems[itemIndex].includeInsurance,
    })

    const startDateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0]
    const endDateStr = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0]

    existingItems[itemIndex].startDate = startDateStr
    existingItems[itemIndex].endDate = endDateStr

    await this.cartRepository.saveCartItems(existingItems)
    return this.getCartItems()
  }

  public async removeFromCart(cartItemId: string): Promise<CartItem[]> {
    const existingItems = await this.cartRepository.getCartItems()
    const filtered = existingItems.filter((item) => item.id !== cartItemId)
    await this.cartRepository.saveCartItems(filtered)
    return this.getCartItems()
  }

  public async clearCart(): Promise<void> {
    await this.cartRepository.clearCart()
  }
}
