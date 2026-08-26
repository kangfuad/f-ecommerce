import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../../database/prisma.service';
import { RegionsService } from './regions.service';

describe('RegionsService', () => {
  let service: RegionsService;
  let prisma: PrismaService;

  const mockPrisma = {
    province: {
      findMany: jest.fn().mockResolvedValue([
        { id: '31', name: 'DKI JAKARTA', altName: 'DKI Jakarta', latitude: -6.2, longitude: 106.8 },
      ]),
    },
    regency: {
      findMany: jest.fn().mockResolvedValue([
        { id: '3171', provinceId: '31', name: 'KOTA JAKARTA SELATAN', altName: null, latitude: null, longitude: null },
      ]),
    },
    district: {
      findMany: jest.fn().mockResolvedValue([
        { id: '3171060', regencyId: '3171', name: 'KEBAYORAN BARU', altName: null, latitude: null, longitude: null },
      ]),
    },
    village: {
      findMany: jest.fn().mockResolvedValue([
        { id: '3171060008', districtId: '3171060', name: 'SELONG', latitude: null, longitude: null },
      ]),
    },
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return list of provinces using getProvinces', async () => {
    const provinces = await service.getProvinces();
    expect(provinces.length).toBe(1);
    expect(provinces[0].name).toBe('DKI JAKARTA');
  });

  it('should return regencies filtered by parent province ID using getRegencies', async () => {
    const regencies = await service.getRegencies('31');
    expect(regencies.length).toBe(1);
    expect(regencies[0].name).toBe('KOTA JAKARTA SELATAN');
    expect(regencies[0].parentId).toBe('31');
  });

  it('should return districts filtered by parent regency ID using getDistricts', async () => {
    const districts = await service.getDistricts('3171');
    expect(districts.length).toBe(1);
    expect(districts[0].name).toBe('KEBAYORAN BARU');
  });

  it('should return villages filtered by parent district ID using getVillages', async () => {
    const villages = await service.getVillages('3171060');
    expect(villages.length).toBe(1);
    expect(villages[0].name).toBe('SELONG');
  });
});
