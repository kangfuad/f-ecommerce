/**
 * App Configuration & Constants
 * Eliminates magic numbers and magic strings across the codebase
 */
export const APP_CONFIG = {
  APP_NAME: 'e-punyasewa',
  TAGLINE: 'Sewa Perlengkapan Apapun, Fleksibel & Terpercaya',
  CURRENCY: {
    CODE: 'IDR',
    SYMBOL: 'Rp',
    LOCALE: 'id-ID',
  },
  RENTAL: {
    MIN_DURATION_DAYS: 1,
    MAX_DURATION_DAYS: 90,
    DEFAULT_DURATION_DAYS: 3,
    DEFAULT_DEPOSIT_PERCENTAGE: 0.3, // 30% of item market value
    LONG_TERM_DISCOUNT_DAYS_THRESHOLD: 7, // 7 days or more gets discount
    LONG_TERM_DISCOUNT_PERCENTAGE: 0.15, // 15% discount for 7+ days
    MONTHLY_DISCOUNT_DAYS_THRESHOLD: 30, // 30 days or more
    MONTHLY_DISCOUNT_PERCENTAGE: 0.25, // 25% discount for 30+ days
    INSURANCE_FEE_PER_DAY: 15000, // Rp 15.000 / day
    FREE_DELIVERY_THRESHOLD: 500000, // Free delivery if total rental >= Rp 500.000
    DEFAULT_DELIVERY_FEE: 35000,
  },
  STORAGE_KEYS: {
    CART: 'eps_cart_items',
    WISHLIST: 'eps_wishlist_ids',
    USER: 'eps_current_user',
  },
  SUPPORT_PHONE: '+62 812-3456-7890',
  SUPPORT_EMAIL: 'halo@epunyasewa.id',
} as const
