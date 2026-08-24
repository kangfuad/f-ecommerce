export enum ProductCategory {
  ALL = 'ALL',
  CAMERA = 'CAMERA',
  DRONE_AUDIO = 'DRONE_AUDIO',
  OUTDOOR = 'OUTDOOR',
  GADGET = 'GADGET',
  FASHION_EVENT = 'FASHION_EVENT',
}

export interface CategoryInfo {
  id: ProductCategory
  name: string
  iconName: string
  description: string
  itemCount: number
  imageUrl: string
}

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: ProductCategory.ALL,
    name: 'Semua Kategori',
    iconName: 'LayoutGrid',
    description: 'Jelajahi seluruh perlengkapan sewa',
    itemCount: 48,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: ProductCategory.CAMERA,
    name: 'Kamera & Lensa',
    iconName: 'Camera',
    description: 'Mirrorless, DSLR, Lensa G-Master & Cinema',
    itemCount: 16,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: ProductCategory.DRONE_AUDIO,
    name: 'Drone & Audio',
    iconName: 'Radio',
    description: 'DJI Drone, Mic Wireless, Stabilizer & Gimbal',
    itemCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: ProductCategory.OUTDOOR,
    name: 'Outdoor & Camping',
    iconName: 'Tent',
    description: 'Tenda Dome, Carrier, Nesting & Peralatan Gunung',
    itemCount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: ProductCategory.GADGET,
    name: 'Gadget & Laptop',
    iconName: 'Laptop',
    description: 'MacBook Pro, iPad Pro, Lighting Studio & Monitor',
    itemCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: ProductCategory.FASHION_EVENT,
    name: 'Fashion & Acara',
    iconName: 'Sparkles',
    description: 'Jas Pria, Gaun Pesta, Kebaya & Aksesoris Event',
    itemCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
  },
]
