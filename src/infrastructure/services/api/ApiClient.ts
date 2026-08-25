import type { ApiResponse } from './ApiResponse'

export class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      const json: any = await response.json()
      if (Array.isArray(json)) {
        return {
          status: 'success',
          data: json as T,
          message: 'Data retrieved successfully',
        }
      }
      if (json && typeof json === 'object' && ('status' in json || 'data' in json)) {
        return json as ApiResponse<T>
      }
      return {
        status: 'success',
        data: json as T,
        message: 'Data retrieved successfully',
      }
    } catch (error: any) {
      console.error(`[ApiClient GET ${endpoint}] Error:`, error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memuat data dari server',
      }
    }
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      const json: ApiResponse<T> = await response.json()
      return json
    } catch (error: any) {
      console.error(`[ApiClient POST ${endpoint}] Error:`, error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal mengirim data ke server',
      }
    }
  }

  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint
    }
    const cleanBase = this.baseUrl.replace(/\/$/, '')
    const cleanEndpoint = endpoint.replace(/^\//, '')
    return cleanBase ? `${cleanBase}/${cleanEndpoint}` : `/${cleanEndpoint}`
  }
}

export const apiClient = new ApiClient()
