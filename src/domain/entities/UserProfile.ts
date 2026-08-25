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
  displayName?: string
  email: string
  phone: string
  address?: string
  postalCode?: string
  emergencyContactName?: string
  emergencyPhone?: string
  emergencyRelation?: string
  profession?: string
  companyOrStudio?: string
  socialMediaInstagram?: string
  city?: string
  bio?: string
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
  public readonly displayName?: string
  public readonly email: string
  public readonly phone: string
  public readonly address?: string
  public readonly postalCode?: string
  public readonly emergencyContactName?: string
  public readonly emergencyPhone?: string
  public readonly emergencyRelation?: string
  public readonly profession?: string
  public readonly companyOrStudio?: string
  public readonly socialMediaInstagram?: string
  public readonly city?: string
  public readonly bio?: string
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
    this.displayName = props.displayName
    this.email = props.email
    this.phone = props.phone
    this.address = props.address
    this.postalCode = props.postalCode
    this.emergencyContactName = props.emergencyContactName
    this.emergencyPhone = props.emergencyPhone
    this.emergencyRelation = props.emergencyRelation
    this.profession = props.profession
    this.companyOrStudio = props.companyOrStudio
    this.socialMediaInstagram = props.socialMediaInstagram
    this.city = props.city
    this.bio = props.bio
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
    const name = this.displayName || this.fullName
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
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

  public get tierBadge(): { label: string; classes: string } {
    switch (this.memberTier) {
      case 'VERIFIED_GOLD':
        return {
          label: '★ Verified Gold',
          classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-black',
        }
      case 'PRO_STUDIO':
        return {
          label: '★ Mitra Studio Pro',
          classes: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-black',
        }
      default:
        return {
          label: 'Starter Member',
          classes: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-theme-border font-bold',
        }
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
