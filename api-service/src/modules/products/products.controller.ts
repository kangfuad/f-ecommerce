import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

@ApiTags('2. Modul Katalog Produk')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Mengambil Daftar Katalog Unit Sewa',
    description:
      'Filter multi-dimensi (kategori, teks pencarian, rentang harga, kondisi, lokasi, sorting) dengan paginasi dan Redis Cache.',
  })
  @ApiResponse({ status: 200, description: 'Daftar katalog berhasil diambil.' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Mengambil Detail Unit Sewa',
    description:
      'Mengambil spesifikasi unit, paket kelengkapan bawaan (includedItems), galeri foto, dan informasi mitra penyedia berdasarkan ID atau Slug.',
  })
  @ApiParam({ name: 'id', description: 'ID Produk (contoh: eps_cam_01) atau Slug Produk' })
  @ApiResponse({ status: 200, description: 'Detail produk berhasil diambil.' })
  @ApiResponse({ status: 404, description: 'Produk tidak ditemukan.' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      message: 'Detail produk berhasil diambil.',
      data: product,
    };
  }
}
