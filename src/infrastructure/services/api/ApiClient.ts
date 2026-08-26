import type { ApiResponse } from './ApiResponse'

export const AUTH_TOKEN_KEY = 'epunyasewa_auth_token'

export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultTimeoutMs = 10000
  private static inFlightRequests = new Map<string, Promise<ApiResponse<any>>>()

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
      headers['Authorization'] = 'Bearer ' + token
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
    const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout after ' + timeoutMs + 'ms')), timeoutMs)
    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timeoutId),
    }
  }

  /**
   * GET Request with in-flight deduplication and auto-retry on network failure
   */
  public async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const token = this.getAuthToken() || 'anon'
    const dedupeKey = 'GET:' + endpoint + ':' + token

    if (ApiClient.inFlightRequests.has(dedupeKey)) {
      return ApiClient.inFlightRequests.get(dedupeKey)! as Promise<ApiResponse<T>>
    }

    const promise = this.executeWithRetry<T>(() => this.executeGet<T>(endpoint, options))
      .finally(() => {
        ApiClient.inFlightRequests.delete(dedupeKey)
      })

    ApiClient.inFlightRequests.set(dedupeKey, promise)
    return promise
  }

  private async executeGet<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
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
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        throw new Error('HTTP Error ' + response.status + ': ' + response.statusText)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } finally {
      cleanup()
    }
  }

  /**
   * Execute with single auto-retry on network blip
   */
  private async executeWithRetry<T>(fn: () => Promise<ApiResponse<T>>, retries = 1): Promise<ApiResponse<T>> {
    try {
      return await fn()
    } catch (error: any) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 350))
        return this.executeWithRetry(fn, retries - 1)
      }
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memuat data dari server',
      }
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
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || ('HTTP Error ' + response.status + ': ' + response.statusText)
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn('[ApiClient POST ' + endpoint + ']', error.message || error)
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
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || ('HTTP Error ' + response.status + ': ' + response.statusText)
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn('[ApiClient PUT ' + endpoint + ']', error.message || error)
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
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || ('HTTP Error ' + response.status + ': ' + response.statusText)
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn('[ApiClient PATCH ' + endpoint + ']', error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal memperbarui sebagian data di server',
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
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || ('HTTP Error ' + response.status + ': ' + response.statusText)
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn('[ApiClient DELETE ' + endpoint + ']', error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal menghapus data dari server',
      }
    } finally {
      cleanup()
    }
  }

  public async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.upload<T>(endpoint, formData, options)
  }

  public async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint)
    const { signal, cleanup } = this.createTimeoutSignal(30000)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options?.headers, true),
        body: formData,
        signal: options?.signal || signal,
        ...options,
      })

      if (!response.ok) {
        if (response.status === 401 && typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem('epunyasewa_auth_user')
        }
        const errorJson = await response.json().catch(() => null)
        const errMsg = errorJson?.message || ('Upload gagal: HTTP ' + response.status)
        throw new Error(errMsg)
      }

      const json: any = await response.json()
      return this.normalizeResponse<T>(json)
    } catch (error: any) {
      console.warn('[ApiClient UPLOAD ' + endpoint + ']', error.message || error)
      return {
        status: 'error',
        data: null as unknown as T,
        message: error.message || 'Gagal mengunggah berkas ke server',
      }
    } finally {
      cleanup()
    }
  }

  private resolveUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : ('/' + endpoint)
    if (this.baseUrl) {
      const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
      return cleanBase + cleanEndpoint
    }
    return '/api/v1' + cleanEndpoint
  }

  private normalizeResponse<T>(json: any): ApiResponse<T> {
    if (json && typeof json === 'object' && 'status' in json) {
      return json as ApiResponse<T>
    }
    return {
      status: 'success',
      data: json as T,
      message: 'OK',
    }
  }
}

export const apiClient = new ApiClient()
