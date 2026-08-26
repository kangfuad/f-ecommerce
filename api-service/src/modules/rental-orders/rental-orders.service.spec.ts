import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { RentalOrdersService } from './rental-orders.service';
import { MeetupLocationType } from '@prisma/client';

describe('RentalOrdersService', () => {
  let service: RentalOrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'eps_drone_01',
          name: 'DJI Mavic 3 Pro',
          providerStoreId: 'prv_01',
          depositAmount: 2500000,
          images: [{ imageUrl: 'https://img.jpg', isPrimary: true }],
        },
      ]),
    },
    rentalOrder: {
      create: jest.fn().mockResolvedValue({
        id: 'EPS-20260826-8901',
        lifecycleStatus: 'PENDING_CONFIRMATION',
        createdAt: new Date('2026-08-26T12:10:00.000Z'),
        pricing: { grandTotal: 1650000 },
      }),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RentalOrdersService>(RentalOrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create booking and return orderId with PENDING_CONFIRMATION status', async () => {
    const result = await service.createBooking('usr_01', {
      items: [
        {
          productId: 'eps_drone_01',
          quantity: 1,
          startDate: '2026-08-27',
          endDate: '2026-08-30',
          rentalDays: 3,
          dailyRate: 550000,
          totalAmount: 1650000,
        },
      ],
      meetup: {
        locationType: MeetupLocationType.PROVIDER_HUB,
        locationName: 'Hub Gandaria',
        locationAddress: 'Jl Gandaria',
        scheduleDate: '2026-08-27',
        scheduleTime: '09:00 WIB',
      },
    });

    expect(result.orderId).toBe('EPS-20260826-8901');
    expect(result.lifecycleStatus).toBe('PENDING_CONFIRMATION');
    expect(result.grandTotal).toBe(1650000);
  });
});
