import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('2. Modul Kategori Produk')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Mengambil Daftar Kategori Unit Sewa',
    description: 'Mengambil seluruh kategori unit perlengkapan sewa yang aktif beserta urutan tampil.',
  })
  @ApiResponse({ status: 200, description: 'Daftar kategori berhasil diambil.' })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return {
      message: 'Daftar kategori berhasil diambil.',
      data: categories,
    };
  }
}
