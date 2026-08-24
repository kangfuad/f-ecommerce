import type { ICartRepository, SerializedCartItem } from '@/application/contracts/ICartRepository'
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import { APP_CONFIG } from '@/core/config/app.config'

export class LocalStorageCartRepository implements ICartRepository {
  private readonly storageKey = APP_CONFIG.STORAGE_KEYS.CART

  public async getCartItems(): Promise<SerializedCartItem[]> {
    return LocalStorageAdapter.getItem<SerializedCartItem[]>(this.storageKey, [])
  }

  public async saveCartItems(items: SerializedCartItem[]): Promise<void> {
    LocalStorageAdapter.setItem(this.storageKey, items)
  }

  public async clearCart(): Promise<void> {
    LocalStorageAdapter.removeItem(this.storageKey)
  }
}
