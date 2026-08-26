import { ProductCategory } from '../enums/ProductCategory'
import { RentalStatus } from '../enums/RentalStatus'
import { ItemCondition } from '../enums/ItemCondition'
import { Money } from '../value-objects/Money'

export interface ProductProps {
  id: string
  name: string
  category: ProductCategory
  dailyRate: number
  marketValue: number // used for deposit calculation
  depositAmount?: number // custom or auto-calculated
  images: string[]
  description: string
  specs: Record<string, string>
  includedItems: string[]
  status: RentalStatus
  condition: ItemCondition
  rating: number
  reviewCount: number
  location: string
  isFeatured?: boolean
  isPopular?: boolean
  badgeText?: string
  provider?: {
    id: string
    name: string
    phone?: string
    rating?: number
    isVerified?: boolean
  }
}

/**
 * Product Entity
 */
export class Product {
  public readonly id: string
  public readonly name: string
  public readonly category: ProductCategory
  public readonly dailyRate: Money
  public readonly marketValue: Money
  public readonly depositAmount: Money
  public readonly images: string[]
  public readonly description: string
  public readonly specs: Record<string, string>
  public readonly includedItems: string[]
  public readonly status: RentalStatus
  public readonly condition: ItemCondition
  public readonly rating: number
  public readonly reviewCount: number
  public readonly location: string
  public readonly isFeatured: boolean
  public readonly isPopular: boolean
  public readonly badgeText?: string
  public readonly provider?: {
    id: string
    name: string
    phone?: string
    rating?: number
    isVerified?: boolean
  }

  constructor(props: ProductProps) {
    this.id = props.id
    this.name = props.name
    this.category = props.category
    this.dailyRate = Money.from(props.dailyRate)
    this.marketValue = Money.from(props.marketValue)
    this.depositAmount = Money.from(props.depositAmount ?? Math.round(props.marketValue * 0.25))
    this.images = props.images
    this.description = props.description
    this.specs = props.specs
    this.includedItems = props.includedItems
    this.status = props.status
    this.condition = props.condition
    this.rating = props.rating
    this.reviewCount = props.reviewCount
    this.location = props.location
    this.isFeatured = props.isFeatured ?? false
    this.isPopular = props.isPopular ?? false
    this.badgeText = props.badgeText
    this.provider = props.provider
  }

  public get primaryImage(): string {
    return this.images[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop'
  }

  public isAvailable(): boolean {
    return this.status === RentalStatus.AVAILABLE
  }
}
