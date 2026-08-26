export interface TenantReviewItem {
  id: string
  providerName: string
  providerAvatar?: string
  productName: string
  rentalDate: string
  rating: number
  comment: string
  tags: string[]
}

export interface UserReputation {
  score: number
  reviewCount: number
  positivePercentage: number
  trustBadges: string[]
  reviews: TenantReviewItem[]
}

export interface SavedAddress {
  id: string
  label: string
  recipientName: string
  phone: string
  fullAddress: string
  city: string
  provinceId?: string
  provinceName?: string
  regencyId?: string
  regencyName?: string
  districtId?: string
  districtName?: string
  villageId?: string
  villageName?: string
  postalCode?: string
  isDefault: boolean
}

export type KycStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'
export type MemberTier = 'STARTER' | 'VERIFIED_GOLD' | 'PRO_STUDIO'

export interface UserProfileProps {
  id: string
  fullName: string
  displayName?: string
  email: string
  phone: string
  address?: string
  provinceId?: string
  provinceName?: string
  regencyId?: string
  regencyName?: string
  districtId?: string
  districtName?: string
  villageId?: string
  villageName?: string
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
  hasProviderStore?: boolean
  providerStoreName?: string
  rentalCount: number
  joinedAt: Date
  savedAddresses?: SavedAddress[]
  reputation?: UserReputation
}

export class UserProfile {
  public readonly id: string
  public readonly fullName: string
  public readonly displayName?: string
  public readonly email: string
  public readonly phone: string
  public readonly address?: string
  public readonly provinceId?: string
  public readonly provinceName?: string
  public readonly regencyId?: string
  public readonly regencyName?: string
  public readonly districtId?: string
  public readonly districtName?: string
  public readonly villageId?: string
  public readonly villageName?: string
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
  public readonly hasProviderStore: boolean
  public readonly providerStoreName?: string
  public readonly rentalCount: number
  public readonly joinedAt: Date
  public readonly savedAddresses: SavedAddress[]
  public readonly reputation: UserReputation

  constructor(props: UserProfileProps) {
    this.id = props.id
    this.fullName = props.fullName
    this.displayName = props.displayName
    this.email = props.email
    this.phone = props.phone
    this.address = props.address
    this.provinceId = props.provinceId
    this.provinceName = props.provinceName
    this.regencyId = props.regencyId
    this.regencyName = props.regencyName
    this.districtId = props.districtId
    this.districtName = props.districtName
    this.villageId = props.villageId
    this.villageName = props.villageName
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
    this.kycStatus = props.kycStatus ?? (props.isKycVerified ? 'VERIFIED' : 'UNVERIFIED')
    this.idType = props.idType
    this.idNumber = props.idNumber
    this.idPhotoUrl = props.idPhotoUrl
    this.selfiePhotoUrl = props.selfiePhotoUrl
    this.memberTier = props.memberTier
    this.hasProviderStore = props.hasProviderStore ?? false
    this.providerStoreName = props.providerStoreName
    this.rentalCount = props.rentalCount
    this.joinedAt = props.joinedAt
    if ((!props.savedAddresses || props.savedAddresses.length === 0) && props.address && props.city) {
      this.savedAddresses = [
        {
          id: `addr_domisili_${props.id}`,
          label: 'Alamat Domisili (Utama)',
          recipientName: props.fullName,
          phone: props.phone,
          fullAddress: props.address,
          city: props.city,
          provinceId: props.provinceId,
          provinceName: props.provinceName,
          regencyId: props.regencyId,
          regencyName: props.regencyName,
          districtId: props.districtId,
          districtName: props.districtName,
          villageId: props.villageId,
          villageName: props.villageName,
          postalCode: props.postalCode || '',
          isDefault: true,
        },
      ]
    } else {
      this.savedAddresses = props.savedAddresses || []
    }
    if (props.reputation) {
      this.reputation = props.reputation
    } else {
      this.reputation = {
        score: 0,
        reviewCount: 0,
        positivePercentage: 0,
        trustBadges: [],
        reviews: [],
      }
    }

    if ((!props.savedAddresses || props.savedAddresses.length === 0) && props.address && props.city) {
      this.savedAddresses = [
        {
          id: `addr_domisili_${props.id}`,
          label: 'Alamat Domisili (Utama)',
          recipientName: props.fullName,
          phone: props.phone,
          fullAddress: props.address,
          city: props.city,
          provinceId: props.provinceId,
          provinceName: props.provinceName,
          regencyId: props.regencyId,
          regencyName: props.regencyName,
          districtId: props.districtId,
          districtName: props.districtName,
          villageId: props.villageId,
          villageName: props.villageName,
          postalCode: props.postalCode || '',
          isDefault: true,
        },
      ]
    } else {
      this.savedAddresses = props.savedAddresses || []
    }
    if (props.reputation) {
      this.reputation = props.reputation
    } else {
      this.reputation = {
        score: 5.0,
        reviewCount: 3,
        positivePercentage: 100,
        trustBadges: [
          "Pengembalian Tepat Waktu (100%)",
          "Unit Terjaga Sangat Baik",
          "Komunikasi Ramah & Kooperatif",
        ],
        reviews: [
          {
            id: "rev_01",
            providerName: "CinemaTech Rental Jakarta",
            productName: "Sony FX3 Cinema Line Full-Frame Camera",
            rentalDate: "20 Feb 2026",
            rating: 5.0,
            comment: "Penyewa sangat profesional, tepat waktu saat jadwal temu serah terima, dan unit kembali dalam kondisi sangat bersih dan rapi. Sangat direkomendasikan untuk mitra sewa lainnya.",
            tags: ["Tepat Waktu", "Unit Sangat Bersih", "Direkomendasikan"],
          },
          {
            id: "rev_02",
            providerName: "Lens & Shutter Studio BSD",
            productName: "DJI Mavic 3 Cine Pro Creator Combo",
            rentalDate: "14 Feb 2026",
            rating: 5.0,
            comment: "Handling unit drone dan baterai sangat baik. Semua aksesoris lengkap tanpa ada goresan sedikitpun. Transaksi lancar dan memuaskan.",
            tags: ["Handling Sempurna", "Aksesoris Lengkap", "Penyewa Teliti"],
          },
          {
            id: "rev_03",
            providerName: "GearUp Pro Audio Jakarta",
            productName: "Sennheiser EW-DP Wireless Mic System",
            rentalDate: "05 Feb 2026",
            rating: 5.0,
            comment: "Sangat kooperatif dan responsif saat koordinasi pengembalian. Member terpercaya bintang 5.",
            tags: ["Responsif", "Terpercaya"],
          },
        ],
      }
    }

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
          label: 'Verified Gold',
          classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-black',
        }
      case 'PRO_STUDIO':
        return {
          label: 'Mitra Studio Pro',
          classes: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-black',
        }
      default:
        return {
          label: 'Starter Member',
          classes: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-theme-border font-bold',
        }
    }
  }

  public get isKycPending(): boolean {
    return this.kycStatus === 'PENDING_REVIEW'
  }

  public get isKycRejected(): boolean {
    return this.kycStatus === 'REJECTED'
  }

  public get isKycUnverified(): boolean {
    return !this.kycStatus || this.kycStatus === 'UNVERIFIED'
  }

  public get kycBadge(): { label: string; classes: string } {
    if (this.isKycVerified || this.kycStatus === 'VERIFIED') {
      return {
        label: 'Penyewa Terverifikasi',
        classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      }
    }
    if (this.kycStatus === 'PENDING_REVIEW') {
      return {
        label: 'Sedang Ditinjau Admin',
        classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      }
    }
    if (this.kycStatus === 'REJECTED') {
      return {
        label: 'Perlu Perbaikan Dokumen',
        classes: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      }
    }
    return {
      label: 'Belum Verifikasi',
      classes: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-theme-border',
    }
  }
}
