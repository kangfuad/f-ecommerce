import { shallowRef, ref, computed } from 'vue'
import { OrderService, type OrderDto, type RentalLifecycleStatus } from '@/infrastructure/services/api'
import { useToast } from './useToast'

export type OrderStatusFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'

const orders = shallowRef<OrderDto[]>([])
const isLoading = ref(false)
const selectedTab = ref<OrderStatusFilter>('ALL')

const activeTimelineOrder = shallowRef<OrderDto | null>(null)
const activeExtendOrder = shallowRef<OrderDto | null>(null)

export function useMyOrders() {
  const { showToast } = useToast()

  async function loadOrders() {
    isLoading.value = true
    try {
      const res = await OrderService.getOrders()
      if (res.status === 'success') {
        orders.value = res.data
      }
    } catch (e: any) {
      console.error('Failed to load orders:', e)
    } finally {
      isLoading.value = false
    }
  }

  const filteredOrders = computed(() => {
    return orders.value.filter((order) => {
      if (selectedTab.value === 'ALL') return true
      if (selectedTab.value === 'ACTIVE') {
        return ['SHIPPING', 'READY_PICKUP', 'ACTIVE_RENTAL', 'PREPARING_QC'].includes(order.lifecycleStatus)
      }
      if (selectedTab.value === 'PENDING') {
        return order.lifecycleStatus === 'PENDING_PAYMENT' || order.paymentStatus === 'PENDING'
      }
      if (selectedTab.value === 'COMPLETED') {
        return order.lifecycleStatus === 'COMPLETED'
      }
      return true
    })
  })

  function openTimeline(order: OrderDto) {
    activeTimelineOrder.value = order
  }

  function closeTimeline() {
    activeTimelineOrder.value = null
  }

  function openExtend(order: OrderDto) {
    activeExtendOrder.value = order
  }

  function closeExtend() {
    activeExtendOrder.value = null
  }

  async function confirmExtendRental(orderId: string, additionalDays: number) {
    try {
      const res = await OrderService.extendRental(orderId, additionalDays)
      if (res.status === 'success') {
        showToast({
          type: 'success',
          title: 'Sewa Berhasil Diperpanjang!',
          message: `Durasi sewa berhasil ditambah ${additionalDays} hari. Selamat menikmati perlengkapan Anda!`,
        })
        closeExtend()
        await loadOrders()
      } else {
        showToast({
          type: 'error',
          title: 'Gagal Perpanjang Sewa',
          message: res.message || 'Terjadi kesalahan saat memperpanjang sewa.',
        })
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Gagal Perpanjang Sewa',
        message: e.message || 'Terjadi kesalahan sistem.',
      })
    }
  }

  return {
    orders,
    filteredOrders,
    isLoading,
    selectedTab,
    activeTimelineOrder,
    activeExtendOrder,
    loadOrders,
    openTimeline,
    closeTimeline,
    openExtend,
    closeExtend,
    confirmExtendRental,
  }
}
