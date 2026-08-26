import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'eps_cam_01',
          name: 'Sony FX3 Cinema Camera',
          slug: 'sony-fx3-cinema-camera',
          description: 'Cinema camera description',
          dailyRate: 650000,
          depositAmount: 3000000,
          condition: 'LIKE_NEW',
          badgeText: 'POPULAR',
          location: 'Jakarta Selatan',
          stockTotal: 4,
          stockAvailable: 3,
          category: { code: 'CAMERA', name: 'Kamera' },
          providerStore: {
            id: 'prv_01',
            storeName: 'CinemaTech Rental Jakarta',
            slug: 'cinematech-rental-jakarta',
            phone: '0811-9876-5432',
            rating: 5.0,
            reviewCount: 42,
            isVerified: true,
          },
          images: [{ imageUrl: 'https://img.jpg', isPrimary: true, displayOrder: 1 }],
          includedItems: [{ itemName: '1x Bodi Sony FX3', displayOrder: 1 }],
        },
      ]),
      findFirst: jest.fn().mockResolvedValue({
        id: 'eps_cam_01',
        name: 'Sony FX3 Cinema Camera',
        slug: 'sony-fx3-cinema-camera',
        description: 'Cinema camera description',
        dailyRate: 650000,
        depositAmount: 3000000,
        condition: 'LIKE_NEW',
        badgeText: 'POPULAR',
        location: 'Jakarta Selatan',
        stockTotal: 4,
        stockAvailable: 3,
        category: { code: 'CAMERA', name: 'Kamera' },
        providerStore: {
          id: 'prv_01',
          storeName: 'CinemaTech Rental Jakarta',
          slug: 'cinematech-rental-jakarta',
          phone: '0811-9876-5432',
          rating: 5.0,
          reviewCount: 42,
          isVerified: true,
        },
        images: [{ imageUrl: 'https://img.jpg', isPrimary: true, displayOrder: 1 }],
        includedItems: [{ id: 'inc_1', itemName: '1x Bodi Sony FX3', quantity: 1, displayOrder: 1 }],
      }),
    },
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find products with pagination metadata', async () => {
    const result: any = await service.findAll({ page: 1, limit: 12 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('eps_cam_01');
    expect(result.pagination.totalItems).toBe(1);
    expect(result.data[0].includedItems).toEqual(['1x Bodi Sony FX3']);
  });

  it('should find single product by ID or slug', async () => {
    const result = await service.findOne('eps_cam_01');
    expect(result.id).toBe('eps_cam_01');
    expect(result.name).toBe('Sony FX3 Cinema Camera');
    expect(result.provider.name).toBe('CinemaTech Rental Jakarta');
  });
});
