import { ref, computed, watch, inject } from 'vue'
import { Product } from '@/domain/entities/Product'
import { RentalBooking } from '@/domain/entities/RentalBooking'
import { TOKENS } from '@/infrastructure/di/tokens'
import { DIContainer } from '@/infrastructure/di/container'
import { formatDateInput, addDays } from '@/core/utils/date'
import { APP_CONFIG } from '@/core/config/app.config'

export function useRentalCalculator(product: () => Product | null) {
  const calculatorUseCase = inject(
    TOKENS.CALCULATE_RENTAL_PRICE_USE_CASE,
    DIContainer.calculatorUseCase
  )

  const today = new Date()
  const defaultStart = formatDateInput(today)
  const defaultEnd = formatDateInput(addDays(today, APP_CONFIG.RENTAL.DEFAULT_DURATION_DAYS))

  const startDate = ref(defaultStart)
  const endDate = ref(defaultEnd)
  const quantity = ref(1)
  const includeInsurance = ref(true)
  const calculationError = ref<string | null>(null)

  const currentBooking = computed<RentalBooking | null>(() => {
    const currentProduct = product()
    if (!currentProduct) return null

    try {
      calculationError.value = null
      return calculatorUseCase.execute({
        product: currentProduct,
        startDate: startDate.value,
        endDate: endDate.value,
        quantity: quantity.value,
        includeInsurance: includeInsurance.value,
      })
    } catch (err: any) {
      calculationError.value = err.message || 'Gagal menghitung tarif sewa'
      return null
    }
  })

  // Watch start date: if end date becomes before start date, auto-adjust end date
  watch(startDate, (newStart) => {
    if (newStart && endDate.value && new Date(endDate.value) < new Date(newStart)) {
      endDate.value = formatDateInput(addDays(new Date(newStart), 1))
    }
  })

  function setDates(start: string, end: string) {
    startDate.value = start
    endDate.value = end
  }

  function setQuantity(qty: number) {
    quantity.value = Math.max(1, qty)
  }

  function toggleInsurance() {
    includeInsurance.value = !includeInsurance.value
  }

  return {
    startDate,
    endDate,
    quantity,
    includeInsurance,
    calculationError,
    currentBooking,
    setDates,
    setQuantity,
    toggleInsurance,
  }
}
