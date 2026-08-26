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

  public static async getFaqs(): Promise<ApiResponse<FaqDto[]>> {
    // 1. Try real API
    const realRes = await apiClient.get<FaqDto[]>(API_ENDPOINTS.FAQS.LIST)
    if (realRes.status === 'success' && Array.isArray(realRes.data)) {
      return realRes
    }

    return apiClient.get<FaqDto[]>(API_ENDPOINTS.LOCAL_MOCKS.FAQS)
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
