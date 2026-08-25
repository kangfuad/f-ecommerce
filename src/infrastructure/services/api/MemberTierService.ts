import { apiClient } from './ApiClient'
import type { ApiResponse } from './ApiResponse'

export interface MemberTierPerk {
  title: string
  desc: string
}

export interface MemberTierDto {
  id: 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'
  name: string
  tagline: string
  badge: string
  badgeTheme: 'stone' | 'emerald' | 'purple'
  qualification: string
  depositRequirement: string
  isPopular?: boolean
  perks: MemberTierPerk[]
  howToUpgrade: string
}

export interface MemberTiersData {
  data: MemberTierDto[]
  disclaimer: string
}

export class MemberTierService {
  private static cachedData: MemberTiersData | null = null

  public static async getMemberTiers(): Promise<ApiResponse<MemberTiersData>> {
    if (this.cachedData) {
      return {
        status: 'success',
        data: this.cachedData,
        message: 'Member tiers retrieved from cache',
      }
    }

    const response = await apiClient.get<MemberTiersData>('/data/member-tiers.json')
    if (response.status === 'success' && response.data) {
      this.cachedData = response.data
    }
    return response
  }
}
