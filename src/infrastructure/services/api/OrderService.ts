import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'
import type { PaymentMethodType, PaymentStatus, DeliveryMethod } from '@/domain/entities/RentalOrder'

export type RentalLifecycleStatus =
  | 'PENDING_PAYMENT'
  | 'PREPARING_QC'
  | 'SHIPPING'
  | 'READY_PICKUP'
  | 'ACTIVE_RENTAL'
  | 'COMPLETED'
  | 'CANCELLED'

export interface OrderTrackingStep {
  title: string
  time: string
  completed: boolean
  isCurrent?: boolean
}

export interface OrderTrackingInfo {
  courierName?: string
  courierPhone?: string
  resiNumber?: string
  estimatedArrival?: string
  unitHandoverTime?: string
  returnDueTime?: string
  currentStep: number
  steps: OrderTrackingStep[]
}

export interface OrderItemDto {
  productId: string
  productName: string
  primaryImage: string
  quantity: number
  rentalDays: number
  startDate: string
  endDate: string
  dailyRate: number
  depositRate: number
  totalAmount: number
}

export interface OrderDto {
  id: string
  createdAt: string
  paidAt?: string
  lifecycleStatus: RentalLifecycleStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethodType
  vaNumber?: string
  customer: {
    fullName: string
    email: string
    phone: string
    deliveryMethod: DeliveryMethod
    deliveryAddress?: string
    pickupHub?: string
    ktpPhotoName?: string
  }
  items: OrderItemDto[]
  pricing: {
    subtotalRental: number
    totalDeposit: number
    isDepositWaived: boolean
    deliveryFee: number
    grandTotal: number
  }
  tracking?: OrderTrackingInfo
}

const LOCAL_ORDERS_STORAGE_KEY = 'epunyasewa_my_orders_list'

export class OrderService {
  public static async getOrders(): Promise<ApiResponse<OrderDto[]>> {
    try {
      const response = await apiClient.get<OrderDto[]>('/data/orders.json')
      const baseOrders = response.status === 'success' && Array.isArray(response.data) ? response.data : []

      // Merge with locally stored active/created orders from checkout
      const localRaw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY)
      const localOrders: OrderDto[] = localRaw ? JSON.parse(localRaw) : []

      // Also check checkout active order
      const checkoutActiveRaw = localStorage.getItem('epunyasewa_active_order')
      if (checkoutActiveRaw) {
        try {
          const parsed = JSON.parse(checkoutActiveRaw)
          if (!localOrders.some((o) => o.id === parsed.id) && !baseOrders.some((o) => o.id === parsed.id)) {
            const mappedOrder: OrderDto = {
              id: parsed.id,
              createdAt: parsed.createdAt,
              paidAt: parsed.paidAt,
              lifecycleStatus: parsed.paymentStatus === 'PAID' ? 'ACTIVE_RENTAL' : 'PENDING_PAYMENT',
              paymentStatus: parsed.paymentStatus,
              paymentMethod: parsed.paymentMethod,
              vaNumber: parsed.vaNumber,
              customer: parsed.customer,
              items: parsed.items,
              pricing: parsed.pricing,
              tracking: {
                currentStep: parsed.paymentStatus === 'PAID' ? 3 : 1,
                steps: [
                  { title: 'Pesanan Dibuat', time: 'Baru saja', completed: true },
                  { title: 'Pembayaran', time: parsed.paymentStatus === 'PAID' ? 'Lunas' : 'Menunggu', completed: parsed.paymentStatus === 'PAID', isCurrent: parsed.paymentStatus !== 'PAID' },
                  { title: 'Penyiapan & Sterilisasi Unit', time: 'Estimasi 1-2 jam', completed: parsed.paymentStatus === 'PAID' },
                  { title: 'Sewa Aktif', time: 'Sesuai jadwal sewa', completed: parsed.paymentStatus === 'PAID', isCurrent: parsed.paymentStatus === 'PAID' },
                  { title: 'Pengembalian Selesai', time: 'Menunggu', completed: false },
                ],
              },
            }
            localOrders.unshift(mappedOrder)
            localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(localOrders))
          }
        } catch {
          // ignore parsing error
        }
      }

      // Combine unique orders
      const orderMap = new Map<string, OrderDto>()
      for (const ord of [...localOrders, ...baseOrders]) {
        if (!orderMap.has(ord.id)) {
          orderMap.set(ord.id, ord)
        }
      }

      const allCombined = Array.from(orderMap.values())

      return {
        status: 'success',
        data: allCombined,
        message: 'Orders retrieved successfully!',
      }
    } catch (e: any) {
      return {
        status: 'error',
        data: [],
        message: e.message || 'Gagal memuat riwayat pesanan',
      }
    }
  }

  public static async getOrderById(orderId: string): Promise<ApiResponse<OrderDto | null>> {
    const ordersResponse = await this.getOrders()
    if (ordersResponse.status === 'success') {
      const found = ordersResponse.data.find((o) => o.id === orderId) || null
      return {
        status: 'success',
        data: found,
        message: found ? `Order ${orderId} found` : `Order ${orderId} not found`,
      }
    }
    return {
      status: 'error',
      data: null,
      message: ordersResponse.message,
    }
  }

  public static async extendRental(orderId: string, additionalDays: number): Promise<ApiResponse<OrderDto | null>> {
    const ordersResponse = await this.getOrders()
    if (ordersResponse.status === 'success') {
      const order = ordersResponse.data.find((o) => o.id === orderId)
      if (!order) {
        return { status: 'error', data: null, message: 'Pesanan tidak ditemukan' }
      }

      // Calculate additional daily price
      let extraRental = 0
      for (const item of order.items) {
        item.rentalDays += additionalDays
        const itemExtra = item.dailyRate * additionalDays * item.quantity
        item.totalAmount += itemExtra
        extraRental += itemExtra

        // extend end date
        const currentEnd = new Date(item.endDate)
        currentEnd.setDate(currentEnd.getDate() + additionalDays)
        item.endDate = currentEnd.toISOString().split('T')[0]
      }

      order.pricing.subtotalRental += extraRental
      order.pricing.grandTotal += extraRental

      // Save to localStorage
      const localRaw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY)
      const localOrders: OrderDto[] = localRaw ? JSON.parse(localRaw) : []
      const existingIdx = localOrders.findIndex((o) => o.id === orderId)
      if (existingIdx > -1) {
        localOrders[existingIdx] = order
      } else {
        localOrders.push(order)
      }
      localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(localOrders))

      return {
        status: 'success',
        data: order,
        message: `Durasi sewa berhasil diperpanjang +${additionalDays} hari!`,
      }
    }
    return { status: 'error', data: null, message: 'Gagal memperpanjang sewa' }
  }
}
