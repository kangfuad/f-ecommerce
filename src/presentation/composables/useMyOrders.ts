import { shallowRef, ref, computed } from 'vue'
import { OrderService, type OrderDto } from '@/infrastructure/services/api/OrderService'
import { useToast } from './useToast'

export type OrderStatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'

const orders = shallowRef<OrderDto[]>([])
const isLoading = ref(false)
const selectedTab = ref<OrderStatusFilter>('ALL')

export function useMyOrders() {
  const { showToast } = useToast()

  async function loadOrders() {
    isLoading.value = true
    try {
      const res = await OrderService.getOrders()
      if (res.status === 'success' && res.data) {
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
      if (selectedTab.value === 'PENDING') {
        return order.lifecycleStatus === 'PENDING_CONFIRMATION'
      }
      if (selectedTab.value === 'ACTIVE') {
        return order.lifecycleStatus === 'CONFIRMED' || order.lifecycleStatus === 'ACTIVE_RENTAL'
      }
      if (selectedTab.value === 'COMPLETED') {
        return order.lifecycleStatus === 'COMPLETED'
      }
      if (selectedTab.value === 'REJECTED') {
        return order.lifecycleStatus === 'REJECTED' || order.lifecycleStatus === 'CANCELLED'
      }
      return true
    })
  })

  return {
    orders,
    filteredOrders,
    isLoading,
    selectedTab,
    loadOrders,
  }
}
