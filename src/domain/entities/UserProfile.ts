export interface SavedAddress {
  id: string
  label: string
  recipientName: string
  phone: string
  fullAddress: string
  city: string
  postalCode?: string
  isDefault: boolean
}

export type KycStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED'
export type MemberTier = 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'

export interface UserProfileProps {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  isKycVerified: boolean
  kycStatus?: KycStatus
  idType?: 'KTP' | 'SIM' | 'PASPOR'
  idNumber?: string
  idPhotoUrl?: string
  selfiePhotoUrl?: string
  memberTier: MemberTier
  rentalCount: number
  joinedAt: Date
  savedAddresses?: SavedAddress[]
}

export class UserProfile {
  public readonly id: string
  public readonly fullName: string
  public readonly email: string
  public readonly phone: string
  public readonly avatarUrl?: string
  public readonly isKycVerified: boolean
  public readonly kycStatus: KycStatus
  public readonly idType?: 'KTP' | 'SIM' | 'PASPOR'
  public readonly idNumber?: string
  public readonly idPhotoUrl?: string
  public readonly selfiePhotoUrl?: string
  public readonly memberTier: MemberTier
  public readonly rentalCount: number
  public readonly joinedAt: Date
  public readonly savedAddresses: SavedAddress[]

  constructor(props: UserProfileProps) {
    this.id = props.id
    this.fullName = props.fullName
    this.email = props.email
    this.phone = props.phone
    this.avatarUrl = props.avatarUrl
    this.isKycVerified = props.isKycVerified
    this.kycStatus = props.kycStatus || (props.isKycVerified ? 'VERIFIED' : 'UNVERIFIED')
    this.idType = props.idType
    this.idNumber = props.idNumber
    this.idPhotoUrl = props.idPhotoUrl
    this.selfiePhotoUrl = props.selfiePhotoUrl
    this.memberTier = props.memberTier
    this.rentalCount = props.rentalCount
    this.joinedAt = props.joinedAt
    this.savedAddresses = props.savedAddresses || []
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
        return 'Verified Gold'
      case 'PRO_STUDIO':
        return 'Mitra Studio Pro'
      default:
        return 'Starter Member'
    }
  }

  public get kycBadge(): { label: string; classes: string } {
    if (this.isKycVerified || this.kycStatus === 'VERIFIED') {
      return {
        label: 'Terverifikasi (Bebas Deposit)',
        classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      }
    }
    if (this.kycStatus === 'PENDING_REVIEW') {
      return {
        label: 'Sedang Ditinjau',
        classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      }
    }
    return {
      label: 'Belum Verifikasi',
      classes: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-theme-border',
    }
  }
}
