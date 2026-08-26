import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RegionsService } from './regions.service';

@ApiTags('5. Modul Wilayah & Data Master')
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  // ==========================================
  // 1. ENDPOINT PROVINSI
  // ==========================================
  @Public()
  @Get('provinces')
  @ApiOperation({
    summary: '1. Mengambil Daftar Seluruh Provinsi Indonesia',
    description: 'Mengambil seluruh 34 provinsi dengan opsi pencarian kata kunci.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci nama provinsi (misal: JAWA)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Batas jumlah data (default: 100)' })
  @ApiResponse({ status: 200, description: 'Daftar provinsi berhasil diambil.' })
  async getProvinces(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getProvinces(search, limit ? Number(limit) : 100);
    return {
      message: 'Daftar provinsi berhasil diambil.',
      data,
    };
  }

  // ==========================================
  // 2. ENDPOINT KOTA / KABUPATEN
  // ==========================================
  @Public()
  @Get('provinces/:provinceId/regencies')
  @ApiOperation({
    summary: '2a. Mengambil Daftar Kota/Kabupaten berdasarkan ID Provinsi',
    description: 'Mengambil seluruh Kota/Kabupaten di bawah ID Provinsi tertentu (misal: 31 untuk DKI Jakarta).',
  })
  @ApiParam({ name: 'provinceId', description: 'ID Provinsi (misal: 31)', example: '31' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci nama kota/kabupaten' })
  @ApiResponse({ status: 200, description: 'Daftar kota/kabupaten berhasil diambil.' })
  async getRegenciesByProvinceId(
    @Param('provinceId') provinceId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getRegencies(provinceId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kota/kabupaten berhasil diambil.',
      data,
    };
  }

  @Public()
  @Get('regencies')
  @ApiOperation({
    summary: '2b. Mengambil/Mencari Daftar Kota/Kabupaten (Query Param)',
    description: 'Mengambil daftar Kota/Kabupaten dengan query param provinceId dan/atau search.',
  })
  @ApiQuery({ name: 'provinceId', required: false, description: 'Filter berdasarkan ID Provinsi (misal: 31)' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian nama kota/kabupaten' })
  @ApiQuery({ name: 'limit', required: false, description: 'Batas jumlah hasil (default: 200)' })
  @ApiResponse({ status: 200, description: 'Daftar kota/kabupaten berhasil diambil.' })
  async getRegencies(
    @Query('provinceId') provinceId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getRegencies(provinceId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kota/kabupaten berhasil diambil.',
      data,
    };
  }

  // ==========================================
  // 3. ENDPOINT KECAMATAN
  // ==========================================
  @Public()
  @Get('regencies/:regencyId/districts')
  @ApiOperation({
    summary: '3a. Mengambil Daftar Kecamatan berdasarkan ID Kota/Kabupaten',
    description: 'Mengambil seluruh Kecamatan di bawah ID Kota/Kabupaten (misal: 3171 untuk Jakarta Selatan).',
  })
  @ApiParam({ name: 'regencyId', description: 'ID Kota/Kabupaten (misal: 3171)', example: '3171' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci nama kecamatan' })
  @ApiResponse({ status: 200, description: 'Daftar kecamatan berhasil diambil.' })
  async getDistrictsByRegencyId(
    @Param('regencyId') regencyId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getDistricts(regencyId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kecamatan berhasil diambil.',
      data,
    };
  }

  @Public()
  @Get('districts')
  @ApiOperation({
    summary: '3b. Mengambil/Mencari Daftar Kecamatan (Query Param)',
    description: 'Mengambil daftar Kecamatan dengan query param regencyId dan/atau search.',
  })
  @ApiQuery({ name: 'regencyId', required: false, description: 'Filter berdasarkan ID Kota/Kabupaten (misal: 3171)' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian nama kecamatan' })
  @ApiQuery({ name: 'limit', required: false, description: 'Batas jumlah hasil (default: 200)' })
  @ApiResponse({ status: 200, description: 'Daftar kecamatan berhasil diambil.' })
  async getDistricts(
    @Query('regencyId') regencyId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getDistricts(regencyId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kecamatan berhasil diambil.',
      data,
    };
  }

  // ==========================================
  // 4. ENDPOINT KELURAHAN / DESA
  // ==========================================
  @Public()
  @Get('districts/:districtId/villages')
  @ApiOperation({
    summary: '4a. Mengambil Daftar Kelurahan berdasarkan ID Kecamatan',
    description: 'Mengambil seluruh Kelurahan di bawah ID Kecamatan (misal: 3171060 untuk Kebayoran Baru).',
  })
  @ApiParam({ name: 'districtId', description: 'ID Kecamatan (misal: 3171060)', example: '3171060' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci nama kelurahan' })
  @ApiResponse({ status: 200, description: 'Daftar kelurahan berhasil diambil.' })
  async getVillagesByDistrictId(
    @Param('districtId') districtId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getVillages(districtId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kelurahan berhasil diambil.',
      data,
    };
  }

  @Public()
  @Get('villages')
  @ApiOperation({
    summary: '4b. Mengambil/Mencari Daftar Kelurahan (Query Param)',
    description: 'Mengambil daftar Kelurahan dengan query param districtId dan/atau search.',
  })
  @ApiQuery({ name: 'districtId', required: false, description: 'Filter berdasarkan ID Kecamatan (misal: 3171060)' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian nama kelurahan' })
  @ApiQuery({ name: 'limit', required: false, description: 'Batas jumlah hasil (default: 200)' })
  @ApiResponse({ status: 200, description: 'Daftar kelurahan berhasil diambil.' })
  async getVillages(
    @Query('districtId') districtId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getVillages(districtId, search, limit ? Number(limit) : 200);
    return {
      message: 'Daftar kelurahan berhasil diambil.',
      data,
    };
  }

  // ==========================================
  // 5. UNIVERSAL QUERY (Backward Compatibility)
  // ==========================================
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Universal Cascading Wilayah (Legacy Compatibility)',
    description: 'Menyediakan endpoint tunggal dengan query param type=provinces|regencies|districts|villages & parentId.',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['provinces', 'regencies', 'districts', 'villages'] })
  @ApiQuery({ name: 'parentId', required: false, description: 'ID Induk wilayah' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian' })
  @ApiQuery({ name: 'limit', required: false, description: 'Batas jumlah hasil' })
  @ApiResponse({ status: 200, description: 'Data wilayah berhasil diambil.' })
  async getRegions(
    @Query('type') type: string = 'provinces',
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.regionsService.getRegions(
      type,
      parentId,
      search,
      limit ? Number(limit) : 200,
    );
    return {
      message: 'Data wilayah berhasil diambil.',
      data,
    };
  }
}
