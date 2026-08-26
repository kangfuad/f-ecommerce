import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'
import type {
  RentalLifecycleStatus,
  MeetupInfo,
  OrderCustomerInfo,
  ProviderInfo,
  OrderItemSnapshot,
  OrderPricingBreakdown,
} from '@/domain/entities/RentalOrder'
import type { RentalReviewProps } from '@/domain/entities/RentalReview'

export interface OrderDto {
  id: string
  createdAt: string
  confirmedAt?: string
  completedAt?: string
  lifecycleStatus: RentalLifecycleStatus
  customer: OrderCustomerInfo
  provider?: ProviderInfo
  items: OrderItemSnapshot[]
  pricing: OrderPricingBreakdown
  meetup: MeetupInfo
  bookingNotes?: string
  rejectionReason?: string
  signedAgreementUrl?: string
  paymentBillUrl?: string
  userReview?: RentalReviewProps
  providerReview?: RentalReviewProps
}

export interface CreateBookingDto {
  customer: OrderCustomerInfo
  provider?: ProviderInfo
  items: OrderItemSnapshot[]
  meetup: MeetupInfo
  bookingNotes?: string
  pricing: OrderPricingBreakdown
}

const LOCAL_ORDERS_STORAGE_KEY = 'epunyasewa_my_bookings_list'

export class OrderService {
  /**
   * Fetch all bookings merging public/data/orders.json and localStorage additions
   */
  public static async getOrders(): Promise<ApiResponse<OrderDto[]>> {
    try {
      const response = await apiClient.get<OrderDto[]>('/data/orders.json')
      const baseOrders = response.data || []

      // Read local custom orders created during runtime booking
      const localRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY) : null
      let localOrders: OrderDto[] = []
      if (localRaw) {
        try {
          localOrders = JSON.parse(localRaw)
        } catch {
          localOrders = []
        }
      }

      // Merge unique by ID, prioritising local edits
      const combinedMap = new Map<string, OrderDto>()
      baseOrders.forEach((o) => combinedMap.set(o.id, o))
      localOrders.forEach((o) => combinedMap.set(o.id, o))

      const allOrders = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return {
        status: 'success',
        data: allOrders,
        message: 'Daftar booking berhasil dimuat',
      }
    } catch (error) {
      console.error('[OrderService.getOrders] Error:', error)
      return {
        status: 'error',
        data: [],
        message: 'Gagal memuat daftar pesanan booking.',
      }
    }
  }

  /**
   * Get single booking by ID
   */
  public static async getOrderById(orderId: string): Promise<ApiResponse<OrderDto | null>> {
    const res = await this.getOrders()
    const found = (res.data || []).find((o) => o.id === orderId) || null
    return {
      status: found ? 'success' : 'error',
      data: found,
      message: found ? 'Data booking ditemukan' : 'Booking tidak ditemukan',
    }
  }

  /**
   * Submit new booking request (Status: PENDING_CONFIRMATION)
   */
  public static async submitBooking(dto: CreateBookingDto): Promise<ApiResponse<OrderDto>> {
    const id = `EPS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    
    // Default provider assignment if none specified
    const defaultProvider: ProviderInfo = dto.provider || {
      id: 'prv_cinematech_jkt',
      name: 'CinemaTech Rental Jakarta',
      phone: '0811-9876-5432',
      address: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
      rating: 4.9,
    }

    const newOrder: OrderDto = {
      id,
      createdAt: new Date().toISOString(),
      lifecycleStatus: 'PENDING_CONFIRMATION',
      customer: dto.customer,
      provider: defaultProvider,
      items: dto.items,
      pricing: dto.pricing,
      meetup: dto.meetup,
      bookingNotes: dto.bookingNotes,
    }

    this.saveOrderLocally(newOrder)

    return {
      status: 'success',
      data: newOrder,
      message: 'Pengajuan booking sewa berhasil dikirim ke penyedia.',
    }
  }

  /**
   * Provider action: Accept booking request -> changes status to CONFIRMED
   */
  public static async acceptBooking(orderId: string, note?: string): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const updated: OrderDto = {
      ...res.data,
      lifecycleStatus: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      bookingNotes: note ? `${res.data.bookingNotes || ''} [Catatan Penyedia: ${note}]` : res.data.bookingNotes,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Booking berhasil diterima. Jadwal & lokasi telah dikonfirmasi.',
    }
  }

  /**
   * Provider action: Reject booking request -> changes status to REJECTED
   */
  public static async rejectBooking(orderId: string, reason: string): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const updated: OrderDto = {
      ...res.data,
      lifecycleStatus: 'REJECTED',
      rejectionReason: reason,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Booking telah ditolak.',
    }
  }

  /**
   * Provider action: Upload signed agreement form photo/PDF
   */
  public static async uploadSignedAgreement(orderId: string, agreementUrl: string): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const updated: OrderDto = {
      ...res.data,
      signedAgreementUrl: agreementUrl,
      lifecycleStatus: res.data.lifecycleStatus === 'CONFIRMED' ? 'ACTIVE_RENTAL' : res.data.lifecycleStatus,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Surat perjanjian sewa bertandatangan berhasil diunggah.',
    }
  }

  /**
   * Provider action: Upload payment bill/receipt photo
   */
  public static async uploadPaymentBill(orderId: string, billUrl: string): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const updated: OrderDto = {
      ...res.data,
      paymentBillUrl: billUrl,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Bukti tagihan pembayaran (Bill) berhasil diunggah.',
    }
  }

  /**
   * Extend rental duration for an active order
   */
  public static async extendRental(orderId: string, additionalDays: number): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const order = res.data
    let additionalAmount = 0

    const updatedItems = order.items.map((item) => {
      const currentEnd = new Date(item.endDate)
      currentEnd.setDate(currentEnd.getDate() + additionalDays)
      const newEndDateStr = currentEnd.toISOString().slice(0, 10)
      const newRentalDays = item.rentalDays + additionalDays
      const itemAdditional = item.dailyRate * item.quantity * additionalDays
      additionalAmount += itemAdditional
      return {
        ...item,
        rentalDays: newRentalDays,
        endDate: newEndDateStr,
        totalAmount: item.totalAmount + itemAdditional,
      }
    })

    const newSubtotal = order.pricing.subtotalRental + additionalAmount
    const newGrandTotal = (order.pricing.grandTotal || order.pricing.subtotalRental) + additionalAmount

    const updated: OrderDto = {
      ...order,
      items: updatedItems,
      pricing: {
        ...order.pricing,
        subtotalRental: newSubtotal,
        grandTotal: newGrandTotal,
      },
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: `Masa sewa berhasil diperpanjang +${additionalDays} hari.`,
    }
  }

  /**
   * Complete rental after offline handover and return
   */
  public static async completeRental(orderId: string): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const updated: OrderDto = {
      ...res.data,
      lifecycleStatus: 'COMPLETED',
      completedAt: new Date().toISOString(),
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Masa sewa telah selesai dan transaksi ditutup.',
    }
  }

  /**
   * Submit User (Tenant) review for Provider
   */
  public static async submitUserReview(
    orderId: string,
    review: Omit<RentalReviewProps, 'id' | 'orderId' | 'authorRole' | 'createdAt'>
  ): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const userReview: RentalReviewProps = {
      id: `rev_usr_${Date.now()}`,
      orderId,
      authorRole: 'TENANT',
      createdAt: new Date(),
      ...review,
    }

    const updated: OrderDto = {
      ...res.data,
      userReview,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Ulasan untuk penyedia sewa berhasil dikirim.',
    }
  }

  /**
   * Submit Provider review for User (Tenant)
   */
  public static async submitProviderReview(
    orderId: string,
    review: Omit<RentalReviewProps, 'id' | 'orderId' | 'authorRole' | 'createdAt'>
  ): Promise<ApiResponse<OrderDto>> {
    const res = await this.getOrderById(orderId)
    if (!res.data) {
      return { status: 'error', data: null as any, message: 'Booking tidak ditemukan' }
    }

    const providerReview: RentalReviewProps = {
      id: `rev_prv_${Date.now()}`,
      orderId,
      authorRole: 'PROVIDER',
      createdAt: new Date(),
      ...review,
    }

    const updated: OrderDto = {
      ...res.data,
      providerReview,
    }

    this.saveOrderLocally(updated)

    return {
      status: 'success',
      data: updated,
      message: 'Penilaian reputasi penyewa berhasil dikirim.',
    }
  }

  /**
   * Persist order into localStorage
   */
  private static saveOrderLocally(order: OrderDto) {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY)
      let list: OrderDto[] = raw ? JSON.parse(raw) : []
      const index = list.findIndex((o) => o.id === order.id)
      if (index >= 0) {
        list[index] = order
      } else {
        list.unshift(order)
      }
      localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn('[OrderService.saveOrderLocally] Failed to write localStorage:', e)
    }
  }
}
