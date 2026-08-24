/**
 * LocalStorageAdapter
 * Safe wrapper around browser localStorage with serialization & error tolerance
 */
export class LocalStorageAdapter {
  public static getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue
      }
      const item = window.localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (e) {
      console.warn(`Failed to write to localStorage key "${key}":`, e)
    }
  }

  public static removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch (e) {
      console.warn(`Failed to remove localStorage key "${key}":`, e)
    }
  }
}
