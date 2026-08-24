export enum ItemCondition {
  LIKE_NEW = 'LIKE_NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
}

export const ItemConditionLabel: Record<ItemCondition, string> = {
  [ItemCondition.LIKE_NEW]: 'Seperti Baru (99%)',
  [ItemCondition.EXCELLENT]: 'Sangat Bagus (95%)',
  [ItemCondition.GOOD]: 'Bagus & Terawat (90%)',
}
