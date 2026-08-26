import { apiClient, AUTH_TOKEN_KEY } from './ApiClient'
import { API_ENDPOINTS } from './ApiEndpoints'
import type { ApiResponse } from './ApiResponse'
import type { SavedAddress } from '@/domain/entities/UserProfile'

export interface AuthUserDto {
  id: string
  fullName: string
  displayName?: string
  email: string
  phone: string
  emergencyContactName?: string
  emergencyPhone?: string
  emergencyRelation?: string
  profession?: string
  companyOrStudio?: string
  socialMediaInstagram?: string
  city?: string
  provinceId?: string
  provinceName?: string
  regencyId?: string
  regencyName?: string
  districtId?: string
  districtName?: string
  villageId?: string
  villageName?: string
  address?: string
  postalCode?: string
  bio?: string
  isKycVerified: boolean
  kycStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED'
  idType?: 'KTP' | 'SIM' | 'PASPOR'
  idNumber?: string
  initials: string
  membershipTier?: 'SILVER' | 'GOLD' | 'PLATINUM'
  hasProviderStore?: boolean
  providerStoreName?: string
  avatarUrl?: string
  savedAddresses?: SavedAddress[]
}

export interface AuthResultDto {
  token: string
  refreshToken?: string
  user: AuthUserDto
}

export interface RegisterPayloadDto {
  fullName: string
  email: string
  phone: string
  password?: string
}

export class AuthService {
  /**
   * Login with Identifier (Email / WhatsApp) & Password
   */
  public static async loginWithCredentials(
    identifier: string,
    password?: string
  ): Promise<ApiResponse<AuthResultDto>> {
    // 1. Try real backend API
    const realRes = await apiClient.post<AuthResultDto>(API_ENDPOINTS.AUTH.LOGIN, {
      identifier,
      password: password || 'PasswordRahasia123!',
    })

    if (realRes.status === 'success' && realRes.data && realRes.data.token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, realRes.data.token)
      }
      return realRes
    }

    // 2. Fallback to local mock data
    const response = await apiClient.get<AuthResultDto>(API_ENDPOINTS.LOCAL_MOCKS.AUTH_USER)
    if (response.status === 'success' && response.data) {
      const parts = identifier.split('@')[0].split(/[._-]/)
      const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Member Pengguna'
      const initials = parts.map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('') || 'MP'

      const customUser: AuthUserDto = {
        ...response.data.user,
        fullName: name,
        email: identifier.includes('@') ? identifier : response.data.user.email,
        phone: !identifier.includes('@') ? identifier : response.data.user.phone,
        initials: initials,
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token || 'mock_jwt_token')
      }

      return {
        status: 'success',
        data: {
          ...response.data,
          user: customUser,
        },
        message: 'Login berhasil.',
      }
    }
    return response
  }

  /**
   * Register new tenant account
   */
  public static async register(
    payload: RegisterPayloadDto
  ): Promise<ApiResponse<AuthResultDto>> {
    // 1. Try real backend API
    const realRes = await apiClient.post<AuthResultDto>(API_ENDPOINTS.AUTH.REGISTER, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password || 'PasswordKuat123!',
    })

    if (realRes.status === 'success' && realRes.data && realRes.data.token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, realRes.data.token)
      }
      return realRes
    }

    // 2. Fallback mock user
    const initials = payload.fullName
      .split(' ')
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'EP'

    const mockUser: AuthUserDto = {
      id: `usr_${Date.now()}`,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      initials,
      isKycVerified: true,
      hasProviderStore: false,
    }

    const mockResult: AuthResultDto = {
      token: `mock_jwt_${Date.now()}`,
      user: mockUser,
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, mockResult.token)
    }

    return {
      status: 'success',
      data: mockResult,
      message: 'Pendaftaran akun berhasil.',
    }
  }

  /**
   * Get Current User Profile from API
   */
  public static async getProfile(): Promise<ApiResponse<AuthUserDto>> {
    const realRes = await apiClient.get<AuthUserDto>(API_ENDPOINTS.USER.PROFILE)
    if (realRes.status === 'success' && realRes.data) {
      return realRes
    }
    // Fallback to local auth-user
    const mockRes = await apiClient.get<AuthResultDto>(API_ENDPOINTS.LOCAL_MOCKS.AUTH_USER)
    return {
      status: mockRes.status,
      data: mockRes.data?.user as AuthUserDto,
      message: mockRes.message,
    }
  }

  /**
   * Update User Profile on API
   */
  public static async updateProfile(payload: Partial<AuthUserDto>): Promise<ApiResponse<AuthUserDto>> {
    const realRes = await apiClient.put<AuthUserDto>(API_ENDPOINTS.USER.PROFILE, payload)
    if (realRes.status === 'success' && realRes.data) {
      return realRes
    }
    return {
      status: 'success',
      data: payload as AuthUserDto,
      message: 'Profil berhasil diperbarui secara lokal.',
    }
  }

  public static async loginWithGoogle(): Promise<ApiResponse<AuthResultDto>> {
    const response = await apiClient.get<AuthResultDto>(API_ENDPOINTS.LOCAL_MOCKS.AUTH_USER)
    if (response.status === 'success' && response.data) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token || 'mock_google_jwt')
      }
      return {
        status: 'success',
        data: {
          ...response.data,
          user: {
            ...response.data.user,
            fullName: 'Auri Fuad (Google)',
            email: 'auri.fuad@gmail.com',
            initials: 'AF',
            isKycVerified: true,
          },
        },
        message: 'Authenticated successfully via Google SSO',
      }
    }
    return response
  }

  public static async loginWithApple(): Promise<ApiResponse<AuthResultDto>> {
    const response = await apiClient.get<AuthResultDto>(API_ENDPOINTS.LOCAL_MOCKS.AUTH_USER)
    if (response.status === 'success' && response.data) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token || 'mock_apple_jwt')
      }
      return {
        status: 'success',
        data: {
          ...response.data,
          user: {
            ...response.data.user,
            fullName: 'Auri Fuad (Apple)',
            email: 'auri.fuad@icloud.com',
            initials: 'AF',
            isKycVerified: true,
          },
        },
        message: 'Authenticated successfully via Apple ID SSO',
      }
    }
    return response
  }

  public static logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }

  public static async refreshToken(): Promise<ApiResponse<AuthResultDto>> {
    return apiClient.get<AuthResultDto>(API_ENDPOINTS.LOCAL_MOCKS.AUTH_USER)
  }
}
