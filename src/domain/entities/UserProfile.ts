export interface UserProfileProps {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  isKycVerified: boolean
  memberTier: 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'
  rentalCount: number
  joinedAt: Date
}

export class UserProfile {
  public readonly id: string
  public readonly fullName: string
  public readonly email: string
  public readonly phone: string
  public readonly avatarUrl?: string
  public readonly isKycVerified: boolean
  public readonly memberTier: 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'
  public readonly rentalCount: number
  public readonly joinedAt: Date

  constructor(props: UserProfileProps) {
    this.id = props.id
    this.fullName = props.fullName
    this.email = props.email
    this.phone = props.phone
    this.avatarUrl = props.avatarUrl
    this.isKycVerified = props.isKycVerified
    this.memberTier = props.memberTier
    this.rentalCount = props.rentalCount
    this.joinedAt = props.joinedAt
  }

  public get initials(): string {
    const parts = this.fullName.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return this.fullName.slice(0, 2).toUpperCase()
  }

  public get tierLabel(): string {
    switch (this.memberTier) {
      case 'VERIFIED_GOLD':
        return 'Member Terverifikasi'
      case 'PRO_STUDIO':
        return 'Mitra Studio Pro'
      default:
        return 'Member Baru'
    }
  }
}
