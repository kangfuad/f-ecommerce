/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T
  message?: string
  meta?: any
}
