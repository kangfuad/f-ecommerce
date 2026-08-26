import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RegionsService } from './regions.service';

describe('RegionsService', () => {
  let service: RegionsService;

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
  });

  it('should return list of provinces by default', async () => {
    const provinces = await service.getRegions('provinces');
    expect(provinces.length).toBeGreaterThan(0);
    expect(provinces.some((p) => p.name === 'DKI JAKARTA')).toBe(true);
  });

  it('should return regencies filtered by province ID parent', async () => {
    const regencies = await service.getRegions('regencies', '31');
    expect(regencies.length).toBeGreaterThan(0);
    expect(regencies.every((r) => r.parentId === '31')).toBe(true);
    expect(regencies.some((r) => r.name === 'KOTA JAKARTA SELATAN')).toBe(true);
  });

  it('should return districts filtered by regency ID parent', async () => {
    const districts = await service.getRegions('districts', '3171');
    expect(districts.length).toBeGreaterThan(0);
    expect(districts.some((d) => d.name === 'KEBAYORAN BARU')).toBe(true);
  });

  it('should return villages filtered by district ID parent', async () => {
    const villages = await service.getRegions('villages', '3171060');
    expect(villages.length).toBeGreaterThan(0);
    expect(villages.some((v) => v.name === 'SELONG')).toBe(true);
  });
});
