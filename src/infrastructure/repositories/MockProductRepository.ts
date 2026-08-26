import type { IProductRepository, ProductFilterParams } from '@/application/contracts/IProductRepository'
import { Product } from '@/domain/entities/Product'
import { ProductCategory } from '@/domain/enums/ProductCategory'
import { RentalStatus } from '@/domain/enums/RentalStatus'
import { ItemCondition } from '@/domain/enums/ItemCondition'
import { ProductService, type ProductRawDto } from '../services/api'

export class MockProductRepository implements IProductRepository {
  private productsCache: Product[] | null = null

  private readonly fallbackProducts: Product[] = [
    new Product({
      id: 'eps_cam_01',
      name: 'Sony Alpha 7 IV Mirrorless Camera Kit',
      category: ProductCategory.CAMERA,
      dailyRate: 350000,
      marketValue: 32000000,
      depositAmount: 1500000,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Kamera full-frame hybrid 33MP terbaik untuk foto & video 4K 60p 10-bit 4:2:2. Dilengkapi lensa Sony FE 24-70mm f/2.8 GM II.',
      specs: {
        'Sensor': '33MP Full-Frame Exmor R CMOS',
        'Video': '4K 60p 10-Bit 4:2:2 All-Intra',
        'Lensa': 'FE 24-70mm f/2.8 GM II',
        'Autofokus': '759-point Phase Detection Real-time Eye AF',
        'Stabilizer': '5-axis SteadyShot In-body',
      },
      includedItems: [
        'Body Sony A7 IV',
        'Lensa 24-70mm GM II',
        '2x Baterai NP-FZ100 & Dual Charger',
        'SD Card V90 128GB High Speed',
        'Tas Kamera Vanguard & Cleaning Kit',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.LIKE_NEW,
      rating: 4.9,
      reviewCount: 48,
      location: 'Jakarta Selatan & BSD',
      isFeatured: true,
      isPopular: true,
      badgeText: 'Paling Laris',
    }),
    new Product({
      id: 'eps_drone_01',
      name: 'DJI Mavic 3 Pro Cine Combo Drone',
      category: ProductCategory.DRONE_AUDIO,
      dailyRate: 550000,
      marketValue: 48000000,
      depositAmount: 2500000,
      images: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Drone flagship dengan Triple Camera Hasselblad 4/3 CMOS, 5.1K Apple ProRes 422 HQ, transmisi O3+ hingga 15km, dan sensor obstacle omnidirectional.',
      specs: {
        'Kamera': 'Triple Cam: 24mm Hasselblad + 70mm + 166mm Tele',
        'Video': '5.1K/50fps, D-Log M, Apple ProRes',
        'Waktu Terbang': 'Hingga 43 Menit per baterai',
        'Jangkauan': '15 KM O3+ HD Transmission',
      },
      includedItems: [
        'Unit Drone DJI Mavic 3 Pro',
        'Remote DJI RC Pro Screen',
        '3x Intelligent Flight Battery & Charging Hub',
        'Set ND Filters (ND8/16/32/64)',
        'Hardcase Anti Air Safety Box',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.LIKE_NEW,
      rating: 4.95,
      reviewCount: 36,
      location: 'Jakarta Barat & Pusat',
      isFeatured: true,
      isPopular: true,
      badgeText: 'Pro Flagship',
    }),
    new Product({
      id: 'eps_out_01',
      name: 'Eiger Storm Shield Dome Tent 4P Set',
      category: ProductCategory.OUTDOOR,
      dailyRate: 120000,
      marketValue: 3500000,
      depositAmount: 400000,
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Tenda camping kapasitas 4 orang dengan frame alloy kokoh tahan badai, double layer waterproof 3000mm, dan sirkulasi udara optimal.',
      specs: {
        'Kapasitas': '4 Orang Dewasa',
        'Waterproof': '3000mm PU Coated Ripstop',
        'Frame': 'Aluminium Alloy 7001 T6',
        'Berat': '3.8 Kg',
      },
      includedItems: [
        'Tenda Utama & Flysheet',
        'Frame Alloy & Pasak Baja',
        'Footprint Groundsheet',
        '4x Matras Foil Alumunium',
        'Lampu Tenda Camping LED Rechargeable',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.EXCELLENT,
      rating: 4.8,
      reviewCount: 29,
      location: 'Bandung & Bogor',
      isFeatured: false,
      isPopular: true,
      badgeText: 'Favorit Camping',
    }),
    new Product({
      id: 'eps_gad_01',
      name: 'Apple MacBook Pro 16" M3 Max 64GB',
      category: ProductCategory.GADGET,
      dailyRate: 450000,
      marketValue: 58000000,
      depositAmount: 3000000,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Laptop monster performa untuk kebutuhan rendering 3D, editing video 8K, live broadcast event, dan coding intensif.',
      specs: {
        'Processor': 'Apple M3 Max 16-Core CPU 40-Core GPU',
        'RAM': '64GB Unified Memory',
        'Storage': '1TB NVMe Super Fast SSD',
        'Layar': '16.2" Liquid Retina XDR 120Hz ProMotion',
      },
      includedItems: [
        'MacBook Pro 16" M3 Max Space Black',
        '140W USB-C Power Adapter & MagSafe 3 Cable',
        'Satechi USB-C Multiport Hub',
        'Tomtoc Protective Hardcase Sleeve',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.LIKE_NEW,
      rating: 5.0,
      reviewCount: 22,
      location: 'Jakarta Selatan',
      isFeatured: true,
      isPopular: false,
      badgeText: 'Extreme Power',
    }),
    new Product({
      id: 'eps_audio_01',
      name: 'Shure SM7B + Rodecaster Pro II Audio Set',
      category: ProductCategory.DRONE_AUDIO,
      dailyRate: 280000,
      marketValue: 18000000,
      depositAmount: 1000000,
      images: [
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Setup podcast & live streaming kelas studio siaran profesional. Dilengkapi Cloudlifter CL-1 dan boom arm Rode PSA1+.',
      specs: {
        'Mikrofon': 'Dynamic Cardioid Shure SM7B',
        'Mixer/Interface': 'Rodecaster Pro II Multi-Track Studio',
        'Preamplifier': 'Cloud Microphones Cloudlifter CL-1',
      },
      includedItems: [
        '2x Shure SM7B Microphone',
        'Rodecaster Pro II Console',
        '2x Rode PSA1+ Boom Arm & XLR Cable Mogami',
        '2x Audio Technica ATH-M50x Headphones',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.LIKE_NEW,
      rating: 4.9,
      reviewCount: 19,
      location: 'Jakarta & Tangerang',
      isFeatured: false,
      isPopular: true,
      badgeText: 'Podcast Studio',
    }),
    new Product({
      id: 'eps_fash_01',
      name: 'Bespoke Tuxedo & Black Tie Gala Suit Set',
      category: ProductCategory.FASHION_EVENT,
      dailyRate: 220000,
      marketValue: 8500000,
      depositAmount: 500000,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      ],
      description: 'Setelan jas tuxedo wol premium Italia untuk pesta pernikahan, gala dinner, wisuda, atau red-carpet photoshoot.',
      specs: {
        'Bahan': 'Italian Super 140s Wool Fabric',
        'Kerah': 'Satin Shawl Lapel',
        'Pilihan Ukuran': 'S, M, L, XL (Bisa fitting)',
      },
      includedItems: [
        'Tuxedo Jacket & Celana Formal',
        'Kemeja Tuxedo Pleated Putih',
        'Dasi Kupu-kupu Sutra & Cummerbund',
        'Suit Cover & Hanger Kayu Premium',
      ],
      status: RentalStatus.AVAILABLE,
      condition: ItemCondition.LIKE_NEW,
      rating: 4.85,
      reviewCount: 31,
      location: 'Jakarta, Surabaya, Bali',
      isFeatured: false,
      isPopular: false,
      badgeText: 'Luxury Formal',
    }),
  ]

  private async fetchProducts(): Promise<Product[]> {
    if (this.productsCache) {
      return this.productsCache
    }

    try {
      const response = await ProductService.getProducts()
      if (response.status === 'success' && Array.isArray(response.data)) {
        this.productsCache = response.data.map(
          (raw: ProductRawDto) =>
            new Product({
              id: raw.id,
              name: raw.name,
              category: raw.category,
              dailyRate: raw.dailyRate,
              marketValue: raw.marketValue || raw.dailyRate * 10,
              depositAmount: raw.depositAmount || 0,
              images: raw.images && raw.images.length > 0 ? raw.images : (raw.primaryImage ? [raw.primaryImage] : []),
              description: raw.description,
              specs: raw.specs || {},
              includedItems: raw.includedItems || [],
              status: raw.status || RentalStatus.AVAILABLE,
              condition: raw.condition,
              rating: raw.rating,
              reviewCount: raw.reviewCount,
              location: raw.location,
              isFeatured: raw.isFeatured,
              isPopular: raw.isPopular,
              badgeText: raw.badgeText,
            })
        )
        return this.productsCache
      }
    } catch (e) {
      console.warn('Fallback to local products array:', e)
    }

    return this.fallbackProducts
  }

  public async getAll(filter?: ProductFilterParams): Promise<Product[]> {
    const products = await this.fetchProducts()
    let result = [...products]

    if (filter?.category && filter.category !== ProductCategory.ALL) {
      result = result.filter((p) => p.category === filter.category)
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    }

    if (filter?.minPrice !== undefined) {
      result = result.filter((p) => p.dailyRate.amount >= filter.minPrice!)
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter((p) => p.dailyRate.amount <= filter.maxPrice!)
    }

    if (filter?.onlyFeatured) {
      result = result.filter((p) => p.isFeatured)
    }

    if (filter?.onlyPopular) {
      result = result.filter((p) => p.isPopular)
    }

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.dailyRate.amount - b.dailyRate.amount)
          break
        case 'price_desc':
          result.sort((a, b) => b.dailyRate.amount - a.dailyRate.amount)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
        case 'popular':
        default:
          result.sort((a, b) => b.reviewCount - a.reviewCount)
          break
      }
    }

    return result
  }

  public async getById(id: string): Promise<Product | null> {
    const products = await this.fetchProducts()
    return products.find((p) => p.id === id) || null
  }

  public async getFeatured(): Promise<Product[]> {
    const products = await this.fetchProducts()
    return products.filter((p) => p.isFeatured)
  }

  public async getPopular(): Promise<Product[]> {
    const products = await this.fetchProducts()
    return products.filter((p) => p.isPopular)
  }

  public async getByCategory(category: ProductCategory): Promise<Product[]> {
    const products = await this.fetchProducts()
    if (category === ProductCategory.ALL) return products
    return products.filter((p) => p.category === category)
  }
}
