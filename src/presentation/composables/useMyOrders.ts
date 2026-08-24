import { shallowRef, ref, computed } from 'vue'
import { OrderService, type OrderDto, type RentalLifecycleStatus } from '@/infrastructure/services/api'
import { useToast } from './useToast'
import { useCart } from './useCart'
import { useWishlist } from './useWishlist'

export type OrderStatusFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'

const orders = shallowRef<OrderDto[]>([])
const isLoading = ref(false)
const selectedTab = ref<OrderStatusFilter>('ALL')

const activeTimelineOrder = shallowRef<OrderDto | null>(null)
const activeExtendOrder = shallowRef<OrderDto | null>(null)
const activePaymentOrder = shallowRef<OrderDto | null>(null)
const activeCancelOrder = shallowRef<OrderDto | null>(null)

export function useMyOrders() {
  const { showToast } = useToast()
  const { removeItemsByProductIds, clearCart } = useCart()
  const { removeWishlist } = useWishlist()

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
        return (
          (order.lifecycleStatus === 'PENDING_PAYMENT' || order.paymentStatus === 'PENDING') &&
          order.lifecycleStatus !== 'CANCELLED' &&
          order.paymentStatus !== 'CANCELLED'
        )
      }
      if (selectedTab.value === 'COMPLETED') {
        return order.lifecycleStatus === 'COMPLETED' || order.lifecycleStatus === 'CANCELLED' || order.paymentStatus === 'CANCELLED'
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

  function openPayment(order: OrderDto) {
    activePaymentOrder.value = order
  }

  function closePayment() {
    activePaymentOrder.value = null
  }

  function openCancel(order: OrderDto) {
    activeCancelOrder.value = order
  }

  function closeCancel() {
    activeCancelOrder.value = null
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

  async function confirmPayOrder(orderId: string) {
    try {
      const targetOrder = orders.value.find((o) => o.id === orderId)
      const res = await OrderService.payOrder(orderId)
      if (res.status === 'success') {
        showToast({
          type: 'success',
          title: 'Pembayaran Berhasil Dikonfirmasi!',
          message: `Pesanan ${orderId} telah lunas. Tim kami segera menyiapkan unit sewa Anda.`,
        })

        // Clean up paid items from cart and wishlist
        if (targetOrder && targetOrder.items && targetOrder.items.length > 0) {
          const paidProductIds = targetOrder.items.map((it) => it.productId)
          await removeItemsByProductIds(paidProductIds)
          for (const pid of paidProductIds) {
            removeWishlist(pid)
          }
        } else {
          await clearCart()
        }

        closePayment()
        await loadOrders()
      } else {
        showToast({
          type: 'error',
          title: 'Gagal Konfirmasi Pembayaran',
          message: res.message || 'Terjadi kesalahan.',
        })
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Gagal Konfirmasi Pembayaran',
        message: e.message || 'Terjadi kesalahan sistem.',
      })
    }
  }

  async function confirmCancelOrder(orderId: string, reason: string) {
    try {
      const res = await OrderService.cancelOrder(orderId, reason)
      if (res.status === 'success') {
        showToast({
          type: 'info',
          title: 'Pesanan Telah Dibatalkan',
          message: `Pesanan ${orderId} berhasil dibatalkan. Pengembalian dana 100% sedang diproses.`,
        })
        closeCancel()
        await loadOrders()
      } else {
        showToast({
          type: 'error',
          title: 'Gagal Membatalkan Pesanan',
          message: res.message || 'Terjadi kesalahan.',
        })
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Gagal Membatalkan Pesanan',
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
    activePaymentOrder,
    activeCancelOrder,
    loadOrders,
    openTimeline,
    closeTimeline,
    openExtend,
    closeExtend,
    openPayment,
    closePayment,
    openCancel,
    closeCancel,
    confirmExtendRental,
    confirmPayOrder,
    confirmCancelOrder,
  }
}
