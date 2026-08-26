export interface ReviewAspectRating {
  aspect: string
  score: number // 1 - 5
}

export interface RentalReviewProps {
  id: string
  orderId: string
  authorRole: 'TENANT' | 'PROVIDER'
  authorName: string
  authorAvatar?: string
  targetName: string
  overallRating: number // 1 - 5
  aspects?: ReviewAspectRating[]
  comment: string
  createdAt: Date
}

export class RentalReview {
  public readonly id: string
  public readonly orderId: string
  public readonly authorRole: 'TENANT' | 'PROVIDER'
  public readonly authorName: string
  public readonly authorAvatar?: string
  public readonly targetName: string
  public readonly overallRating: number
  public readonly aspects: ReviewAspectRating[]
  public readonly comment: string
  public readonly createdAt: Date

  constructor(props: RentalReviewProps) {
    this.id = props.id
    this.orderId = props.orderId
    this.authorRole = props.authorRole
    this.authorName = props.authorName
    this.authorAvatar = props.authorAvatar
    this.targetName = props.targetName
    this.overallRating = props.overallRating
    this.aspects = props.aspects || []
    this.comment = props.comment
    this.createdAt = props.createdAt
  }
}
