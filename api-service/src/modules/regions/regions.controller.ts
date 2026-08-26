import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RegionsService } from './regions.service';

@ApiTags('5. Modul Wilayah & Data Master')
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Cascading Wilayah Administratif Indonesia (BPS / Kemendagri)',
    description:
      'Menyediakan data berjenjang wilayah Indonesia (Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan) dengan Redis Cache (TTL 24 jam).',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['provinces', 'regencies', 'districts', 'villages'],
    description: 'Tingkat wilayah administratif',
    example: 'provinces',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'ID induk wilayah (wajib jika type regencies/districts/villages)',
    example: '31',
  })
  @ApiResponse({ status: 200, description: 'Data wilayah berhasil diambil.' })
  async getRegions(
    @Query('type') type: string = 'provinces',
    @Query('parentId') parentId?: string,
  ) {
    const data = await this.regionsService.getRegions(type, parentId);
    return {
      message: 'Data wilayah berhasil diambil.',
      data,
    };
  }
}
