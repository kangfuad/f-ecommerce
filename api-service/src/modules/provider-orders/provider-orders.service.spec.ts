import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProviderOrdersService } from './provider-orders.service';

describe('ProviderOrdersService', () => {
  let service: ProviderOrdersService;
  let prisma: PrismaService;
  let storageService: StorageService;

  const mockPrisma = {
    providerStore: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'prv_01',
        userId: 'usr_01',
        storeName: 'CinemaTech Rental Jakarta',
      }),
    },
    rentalOrder: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'EPS-20260826-8901',
          lifecycleStatus: 'PENDING_CONFIRMATION',
          createdAt: new Date(),
          tenant: { id: 'usr_02', fullName: 'Budi Santoso', phone: '081399887766', email: 'budi@example.com' },
          items: [],
          reviews: [],
        },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 'EPS-20260826-8901',
        providerStoreId: 'prv_01',
        lifecycleStatus: 'PENDING_CONFIRMATION',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'EPS-20260826-8901',
        lifecycleStatus: 'CONFIRMED',
      }),
    },
  };

  const mockStorageService = {
    saveFile: jest.fn().mockResolvedValue({
      url: 'http://localhost:3000/uploads/agreements/sample.pdf',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<ProviderOrdersService>(ProviderOrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should get timeline orders for provider store', async () => {
    const timeline = await service.getTimelineOrders('usr_01');
    expect(timeline.pendingCount).toBe(1);
    expect(timeline.orders.length).toBe(1);
    expect(timeline.orders[0].id).toBe('EPS-20260826-8901');
  });

  it('should confirm booking and change lifecycleStatus to CONFIRMED', async () => {
    const result = await service.confirmOrder('usr_01', 'EPS-20260826-8901');
    expect(result.orderId).toBe('EPS-20260826-8901');
    expect(result.lifecycleStatus).toBe('CONFIRMED');
    expect(result.documentNo).toBe('SP-EPS-EPS-20260826-8901');
  });
});
