import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

export interface RegionItem {
  id: string;
  name: string;
  parentId?: string;
}

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  // Master Data Administrative Indonesia (BPS / Kemendagri reference)
  private readonly provinces: RegionItem[] = [
    { id: '31', name: 'DKI JAKARTA' },
    { id: '32', name: 'JAWA BARAT' },
    { id: '33', name: 'JAWA TENGAH' },
    { id: '34', name: 'DI YOGYAKARTA' },
    { id: '35', name: 'JAWA TIMUR' },
    { id: '36', name: 'BANTEN' },
    { id: '51', name: 'BALI' },
    { id: '12', name: 'SUMATERA UTARA' },
    { id: '13', name: 'SUMATERA BARAT' },
    { id: '73', name: 'SULAWESI SELATAN' },
  ];

  private readonly regencies: RegionItem[] = [
    // DKI Jakarta (31)
    { id: '3171', name: 'KOTA JAKARTA SELATAN', parentId: '31' },
    { id: '3172', name: 'KOTA JAKARTA TIMUR', parentId: '31' },
    { id: '3173', name: 'KOTA JAKARTA PUSAT', parentId: '31' },
    { id: '3174', name: 'KOTA JAKARTA BARAT', parentId: '31' },
    { id: '3175', name: 'KOTA JAKARTA UTARA', parentId: '31' },
    { id: '3101', name: 'KABUPATEN KEPULAUAN SERIBU', parentId: '31' },

    // Jawa Barat (32)
    { id: '3273', name: 'KOTA BANDUNG', parentId: '32' },
    { id: '3271', name: 'KOTA BOGOR', parentId: '32' },
    { id: '3275', name: 'KOTA BEKASI', parentId: '32' },
    { id: '3276', name: 'KOTA DEPOK', parentId: '32' },
    { id: '3204', name: 'KABUPATEN BANDUNG', parentId: '32' },

    // Jawa Timur (35)
    { id: '3578', name: 'KOTA SURABAYA', parentId: '35' },
    { id: '3573', name: 'KOTA MALANG', parentId: '35' },
    { id: '3515', name: 'KABUPATEN SIDOARJO', parentId: '35' },

    // Bali (51)
    { id: '5171', name: 'KOTA DENPASAR', parentId: '51' },
    { id: '5103', name: 'KABUPATEN BADUNG', parentId: '51' },
    { id: '5104', name: 'KABUPATEN GIANYAR', parentId: '51' },
  ];

  private readonly districts: RegionItem[] = [
    // Jakarta Selatan (3171)
    { id: '3171060', name: 'KEBAYORAN BARU', parentId: '3171' },
    { id: '3171070', name: 'KEBAYORAN LAMA', parentId: '3171' },
    { id: '3171050', name: 'CILANDAK', parentId: '3171' },
    { id: '3171040', name: 'PASAR MINGGU', parentId: '3171' },
    { id: '3171080', name: 'PESANGGRAHAN', parentId: '3171' },
    { id: '3171020', name: 'MAMPANG PRAPATAN', parentId: '3171' },
    { id: '3171010', name: 'TEBET', parentId: '3171' },
    { id: '3171030', name: 'PANCORAN', parentId: '3171' },
    { id: '3171090', name: 'SETIABUDI', parentId: '3171' },
    { id: '3171100', name: 'JAGAKARSA', parentId: '3171' },

    // Kota Bandung (3273)
    { id: '3273010', name: 'COBLONG', parentId: '3273' },
    { id: '3273020', name: 'SUKAJADI', parentId: '3273' },
    { id: '3273030', name: 'SUMUR BANDUNG', parentId: '3273' },
  ];

  private readonly villages: RegionItem[] = [
    // Kebayoran Baru (3171060)
    { id: '3171060008', name: 'SELONG', parentId: '3171060' },
    { id: '3171060001', name: 'GUNUNG', parentId: '3171060' },
    { id: '3171060002', name: 'KRAMAT PELA', parentId: '3171060' },
    { id: '3171060003', name: 'GANDARIA UTARA', parentId: '3171060' },
    { id: '3171060004', name: 'CIPETE UTARA', parentId: '3171060' },
    { id: '3171060005', name: 'PULO', parentId: '3171060' },
    { id: '3171060006', name: 'MELAWAI', parentId: '3171060' },
    { id: '3171060007', name: 'PETOGOGAN', parentId: '3171060' },
    { id: '3171060009', name: 'RAWA BARAT', parentId: '3171060' },
    { id: '3171060010', name: 'SENAYAN', parentId: '3171060' },

    // Coblong (3273010)
    { id: '3273010001', name: 'DAGO', parentId: '3273010' },
    { id: '3273010002', name: 'LEBAK SILIWANGI', parentId: '3273010' },
    { id: '3273010003', name: 'SADANG SERANG', parentId: '3273010' },
  ];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getRegions(type = 'provinces', parentId?: string): Promise<RegionItem[]> {
    const cacheKey = `regions:${type}:${parentId || 'root'}`;

    try {
      const cached = await this.cacheManager.get<RegionItem[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    let result: RegionItem[] = [];

    switch (type.toLowerCase()) {
      case 'provinces':
        result = this.provinces;
        break;
      case 'regencies':
        result = parentId
          ? this.regencies.filter((r) => r.parentId === parentId)
          : this.regencies;
        break;
      case 'districts':
        result = parentId
          ? this.districts.filter((d) => d.parentId === parentId)
          : this.districts;
        break;
      case 'villages':
        result = parentId
          ? this.villages.filter((v) => v.parentId === parentId)
          : this.villages;
        break;
      default:
        result = this.provinces;
    }

    try {
      await this.cacheManager.set(cacheKey, result, 86400000); // 24h TTL
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }
}
