/**
 * Centralized API Endpoints Registry for e-punyasewa
 * 
 * Organizes all backend API endpoints and local mock fallbacks by category/module.
 * Whenever an endpoint path changes in the backend, only update this file.
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (idOrSlug: string) => `/products/${idOrSlug}`,
  },
  PROVIDER_STORES: {
    DETAIL: (idOrSlug: string) => `/provider-stores/${idOrSlug}`,
  },
  BOOKINGS: {
    SUBMIT: '/bookings',
  },
  ORDERS: {
    MY_ORDERS: '/orders/my-orders',
    DETAIL: (orderId: string) => `/orders/${orderId}`,
    EXTEND: (orderId: string) => `/orders/${orderId}/extend`,
    REVIEW: (orderId: string) => `/orders/${orderId}/review`,
  },
  PROVIDER_ORDERS: {
    TIMELINE: '/provider/orders',
    CONFIRM: (orderId: string) => `/provider/orders/${orderId}/confirm`,
    REJECT: (orderId: string) => `/provider/orders/${orderId}/reject`,
    UPLOAD_DOCUMENTS: (orderId: string) => `/provider/orders/${orderId}/upload-documents`,
    COMPLETE: (orderId: string) => `/provider/orders/${orderId}/complete`,
    REVIEW_TENANT: (orderId: string) => `/provider/orders/${orderId}/review-tenant`,
  },
  REGIONS: {
    PROVINCES: '/regions/provinces',
    REGENCIES_BY_PROVINCE: (provinceId: string) => `/regions/provinces/${provinceId}/regencies`,
    REGENCIES: '/regions/regencies',
    DISTRICTS_BY_REGENCY: (regencyId: string) => `/regions/regencies/${regencyId}/districts`,
    DISTRICTS: '/regions/districts',
    VILLAGES_BY_DISTRICT: (districtId: string) => `/regions/districts/${districtId}/villages`,
    VILLAGES: '/regions/villages',
    LEGACY: '/regions',
  },
  STORAGE: {
    UPLOAD: '/storage/upload',
  },
  FAQS: {
    LIST: '/faqs',
  },
  // Local JSON Mock Fallback Paths
  LOCAL_MOCKS: {
    AUTH_USER: '/data/auth-user.json',
    PRODUCTS: '/data/products.json',
    CATEGORIES: '/data/categories.json',
    ORDERS: '/data/orders.json',
    FAQS: '/data/faq.json',
    PROVINCES: '/data/master-wilayah/provinces.json',
    REGENCIES: '/data/master-wilayah/regencies.json',
    DISTRICTS: '/data/master-wilayah/districts.json',
    VILLAGES: '/data/master-wilayah/villages.json',
  },
} as const

export type ApiEndpointsType = typeof API_ENDPOINTS
