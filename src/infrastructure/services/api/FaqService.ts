import { apiClient } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'

export interface FaqDto {
  id: string
  category: 'PROSEDUR' | 'TRANSAKSI' | 'KEAMANAN' | 'DEPOSIT' | 'ASURANSI' | 'PENGANTARAN' | string
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
    return apiClient.get<FaqDto[]>(API_ENDPOINTS.FAQS.LIST)
  }

  public static async getFaqsByCategory(category: string): Promise<ApiResponse<FaqDto[]>> {
    const allResponse = await this.getFaqs()
    if (allResponse.status === 'success' && Array.isArray(allResponse.data)) {
      if (category === 'ALL') return allResponse
      const filtered = allResponse.data.filter((f) => f.category === category)
      return {
        status: 'success',
        data: filtered,
        message: ('FAQ for category ' + category + ' retrieved'),
      }
    }
    return allResponse
  }
}
