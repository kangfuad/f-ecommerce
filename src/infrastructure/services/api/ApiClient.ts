import type { ApiResponse } from './ApiResponse'

export const AUTH_TOKEN_KEY = 'epunyasewa_auth_token'

export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultTimeoutMs = 10000

  constructor(baseUrl?: string) {
    const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : ''
    this.baseUrl = baseUrl !== undefined ? baseUrl : (envBaseUrl || '')
  }

  /**
   * Get auth token from localStorage if available
   */
  private getAuthToken(): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }

  /**
   * Compose standard headers including optional JWT Authorization header
   */
  private getHeaders(customHeaders?: HeadersInit, isFormData: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((val, key) => {
          headers[key] = val
        })
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, val]) => {
          headers[key] = val
        })
      } else {
        Object.assign(headers, customHeaders)
      }
    }

    return headers
  }

  private createTimeoutSignal(timeoutMs: number = this.defaultTimeoutMs): { signal: AbortSignal; cleanup: () => void } {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timeoutId),
    }
  }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal()
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(options?.headers),
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient GET ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memuat data dari server',
      }
    } finally {
      cleanup()
    }
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal()
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options?.headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || `HTTP Error ${response.status}: ${response.statusText}`
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient POST ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal mengirim data ke server',
      }
    } finally {
      cleanup()
    }
  }

  public async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal()
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(options?.headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || `HTTP Error ${response.status}: ${response.statusText}`
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient PUT ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memperbarui data di server',
      }
    } finally {
      cleanup()
    }
  }

  public async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal()
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(options?.headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || `HTTP Error ${response.status}: ${response.statusText}`
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient PATCH ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memperbarui sebagian data',
      }
    } finally {
      cleanup()
    }
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal()
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(options?.headers),
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || `HTTP Error ${response.status}: ${response.statusText}`
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient DELETE ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal menghapus data dari server',
      }
    } finally {
      cleanup()
    }
  }

  /**
   * Post multipart/form-data for file uploads (e.g. signed agreements, receipts)
   */
  public async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal(15000)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options?.headers, true),
        body: formData,
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || `HTTP Error ${response.status}: ${response.statusText}`
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn(`[ApiClient FormData ${endpoint}]`, error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal mengunggah berkas ke server',
      }
    } finally {
      cleanup()
    }
  }

  private normalizeResponse<T>(json: any): ApiResponse<T> {
    if (json && typeof json === 'object') {
      if ('status' in json && 'data' in json) {
        return json as ApiResponse<T>
      }
      if ('data' in json) {
        return {
          status: 'success',
          data: json.data as T,
          message: json.message || 'Sukses',
          meta: json.meta,
        }
      }
    }
    return {
      status: 'success',
      data: json as T,
      message: 'Sukses',
    }
  }

  public resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint
    }
    // Local static data requests bypass base url
    if (endpoint.startsWith('/data/') || endpoint.startsWith('data/')) {
      return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }

    const cleanBase = this.baseUrl.replace(/\/$/, '')
    const cleanEndpoint = endpoint.replace(/^\//, '')
    return cleanBase ? `${cleanBase}/${cleanEndpoint}` : `/${cleanEndpoint}`
  }
}

export const apiClient = new ApiClient()
