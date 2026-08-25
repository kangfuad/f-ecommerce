import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'

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
  address?: string
  postalCode?: string
  bio?: string
  isKycVerified: boolean
  kycStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED'
  idType?: 'KTP' | 'SIM' | 'PASPOR'
  idNumber?: string
  initials: string
  membershipTier?: 'SILVER' | 'GOLD' | 'PLATINUM'
  avatarUrl?: string
}

export interface AuthResultDto {
  token: string
  refreshToken: string
  user: AuthUserDto
}

export class AuthService {
  public static async loginWithCredentials(
    email: string,
    _password?: string
  ): Promise<ApiResponse<AuthResultDto>> {
    const response = await apiClient.get<AuthResultDto>('/data/auth-user.json')
    if (response.status === 'success' && response.data) {
      const parts = email.split('@')[0].split(/[._-]/)
      const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Member Pengguna'
      const initials = parts.map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('') || 'MP'

      const customUser: AuthUserDto = {
        ...response.data.user,
        fullName: name,
        email: email,
        initials: initials,
      }

      return {
        status: 'success',
        data: {
          ...response.data,
          user: customUser,
        },
        message: 'Login successful via credential authentication',
      }
    }
    return response
  }

  public static async loginWithGoogle(): Promise<ApiResponse<AuthResultDto>> {
    const response = await apiClient.get<AuthResultDto>('/data/auth-user.json')
    if (response.status === 'success' && response.data) {
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
        message: 'Authenticated successfully via Google Single Sign-On (SSO)',
      }
    }
    return response
  }

  public static async loginWithApple(): Promise<ApiResponse<AuthResultDto>> {
    const response = await apiClient.get<AuthResultDto>('/data/auth-user.json')
    if (response.status === 'success' && response.data) {
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
        message: 'Authenticated successfully via Apple ID Single Sign-On (SSO)',
      }
    }
    return response
  }

  public static async refreshToken(): Promise<ApiResponse<AuthResultDto>> {
    return apiClient.get<AuthResultDto>('/data/auth-user.json')
  }
}
