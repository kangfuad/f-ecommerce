import { CartItem } from '@/domain/entities/CartItem'

export interface SerializedCartItem {
  id: string
  productId: string
  startDate: string
  endDate: string
  quantity: number
  includeInsurance: boolean
  createdAt: string
}

export interface ICartRepository {
  getCartItems(): Promise<SerializedCartItem[]>
  saveCartItems(items: SerializedCartItem[]): Promise<void>
  clearCart(): Promise<void>
}
