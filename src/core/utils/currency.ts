import { APP_CONFIG } from '../config/app.config'

/**
 * Format number to Indonesian Rupiah currency string
 * Example: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount)) return 'Rp 0'

  const formatted = new Intl.NumberFormat(APP_CONFIG.CURRENCY.LOCALE, {
    maximumFractionDigits: 0,
  }).format(amount)

  return withPrefix ? `${APP_CONFIG.CURRENCY.SYMBOL} ${formatted}` : formatted
}
