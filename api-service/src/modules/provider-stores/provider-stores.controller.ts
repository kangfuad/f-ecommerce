import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProviderStoresService } from './provider-stores.service';

@ApiTags('4. Modul Panel Mitra Penyedia Sewa')
@Controller('provider-stores')
export class ProviderStoresController {
  constructor(private providerStoresService: ProviderStoresService) {}

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Mengambil Profil Toko Mitra Penyedia',
    description: 'Mengambil detail reputasi toko, kontak, alamat, dan daftar unit inventaris yang aktif.',
  })
  @ApiParam({ name: 'id', description: 'ID Toko atau Slug Toko' })
  @ApiResponse({ status: 200, description: 'Profil toko penyedia berhasil diambil.' })
  @ApiResponse({ status: 404, description: 'Toko penyedia tidak ditemukan.' })
  async findOne(@Param('id') id: string) {
    const data = await this.providerStoresService.findOne(id);
    return {
      message: 'Profil toko penyedia berhasil diambil.',
      data,
    };
  }
}
