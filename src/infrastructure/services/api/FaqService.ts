import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'

export interface FaqDto {
  id: string
  category: 'PROSEDUR' | 'TRANSAKSI' | 'KEAMANAN' | 'DEPOSIT' | 'ASURANSI' | 'PENGANTARAN'
  categoryLabel: string
  question: string
  answer: string
  steps?: string[]
  keyPoints?: string[]
  tip?: string
  isPopular?: boolean
  order?: number
}

export class FaqService {
  private static cachedFaqs: FaqDto[] | null = null

  public static async getFaqs(): Promise<ApiResponse<FaqDto[]>> {
    if (this.cachedFaqs) {
      return {
        status: 'success',
        data: this.cachedFaqs,
        message: 'FAQ retrieved from cache',
      }
    }

    // 1. Try real API
    const realRes = await apiClient.get<FaqDto[]>(API_ENDPOINTS.FAQS.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      this.cachedFaqs = realRes.data
      return realRes
    }

    // 2. Fallback to local json
    const response = await apiClient.get<FaqDto[]>(API_ENDPOINTS.LOCAL_MOCKS.FAQS)
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.cachedFaqs = response.data
    }
    return response
  }

  public static async getFaqsByCategory(category: string): Promise<ApiResponse<FaqDto[]>> {
    const allResponse = await this.getFaqs()
    if (allResponse.status === 'success') {
      if (category === 'ALL') return allResponse
      const filtered = allResponse.data.filter((f) => f.category === category)
      return {
        status: 'success',
        data: filtered,
        message: `FAQ for category ${category} retrieved`,
      }
    }
    return allResponse
  }
}
