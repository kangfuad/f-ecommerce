import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';

export interface RegionResponseItem {
  id: string;
  name: string;
  altName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  parentId?: string | null;
}

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 1. Mengambil Daftar Provinsi
   */
  async getProvinces(search?: string, limit = 100): Promise<RegionResponseItem[]> {
    const cacheKey = `regions:provinces:${search || 'all'}:${limit}`;

    try {
      const cached = await this.cacheManager.get<RegionResponseItem[]>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    const where = search
      ? {
          OR: [
            { name: { contains: search.trim().toUpperCase() } },
            { altName: { contains: search.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {};

    const provinces = await this.prisma.province.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    const result = provinces.map((p) => ({
      id: p.id,
      name: p.name,
      altName: p.altName,
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    try {
      await this.cacheManager.set(cacheKey, result, 86400000); // 24h
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }

  /**
   * 2. Mengambil Daftar Kota / Kabupaten (Filter by provinceId)
   */
  async getRegencies(
    provinceId?: string,
    search?: string,
    limit = 200,
  ): Promise<RegionResponseItem[]> {
    const cacheKey = `regions:regencies:${provinceId || 'all'}:${search || 'all'}:${limit}`;

    try {
      const cached = await this.cacheManager.get<RegionResponseItem[]>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    const where: any = {
      ...(provinceId ? { provinceId: provinceId.trim() } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search.trim().toUpperCase() } },
              { altName: { contains: search.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const regencies = await this.prisma.regency.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    const result = regencies.map((r) => ({
      id: r.id,
      parentId: r.provinceId,
      name: r.name,
      altName: r.altName,
      latitude: r.latitude,
      longitude: r.longitude,
    }));

    try {
      await this.cacheManager.set(cacheKey, result, 86400000);
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }

  /**
   * 3. Mengambil Daftar Kecamatan (Filter by regencyId)
   */
  async getDistricts(
    regencyId?: string,
    search?: string,
    limit = 200,
  ): Promise<RegionResponseItem[]> {
    const cacheKey = `regions:districts:${regencyId || 'all'}:${search || 'all'}:${limit}`;

    try {
      const cached = await this.cacheManager.get<RegionResponseItem[]>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    const where: any = {
      ...(regencyId ? { regencyId: regencyId.trim() } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search.trim().toUpperCase() } },
              { altName: { contains: search.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const districts = await this.prisma.district.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    const result = districts.map((d) => ({
      id: d.id,
      parentId: d.regencyId,
      name: d.name,
      altName: d.altName,
      latitude: d.latitude,
      longitude: d.longitude,
    }));

    try {
      await this.cacheManager.set(cacheKey, result, 86400000);
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }

  /**
   * 4. Mengambil Daftar Kelurahan / Desa (Filter by districtId)
   */
  async getVillages(
    districtId?: string,
    search?: string,
    limit = 200,
  ): Promise<RegionResponseItem[]> {
    const cacheKey = `regions:villages:${districtId || 'all'}:${search || 'all'}:${limit}`;

    try {
      const cached = await this.cacheManager.get<RegionResponseItem[]>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    const where: any = {
      ...(districtId ? { districtId: districtId.trim() } : {}),
      ...(search ? { name: { contains: search.trim().toUpperCase() } } : {}),
    };

    const villages = await this.prisma.village.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    const result = villages.map((v) => ({
      id: v.id,
      parentId: v.districtId,
      name: v.name,
      latitude: v.latitude,
      longitude: v.longitude,
    }));

    try {
      await this.cacheManager.set(cacheKey, result, 86400000);
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }

  /**
   * Universal Cascading Method (Backward-compatible)
   */
  async getRegions(
    type = 'provinces',
    parentId?: string,
    search?: string,
    limit = 200,
  ): Promise<RegionResponseItem[]> {
    switch (type.toLowerCase()) {
      case 'provinces':
        return this.getProvinces(search, limit);
      case 'regencies':
        return this.getRegencies(parentId, search, limit);
      case 'districts':
        return this.getDistricts(parentId, search, limit);
      case 'villages':
        return this.getVillages(parentId, search, limit);
      default:
        return this.getProvinces(search, limit);
    }
  }
}
