import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemCondition } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ProductSortBy {
  POPULAR = 'popular',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
}

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID / Kode Kategori',
    example: 'CAMERA',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Kata kunci pencarian nama atau deskripsi',
    example: 'Sony FX3',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Tarif sewa minimum per hari (Rp)',
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Tarif sewa maksimum per hari (Rp)',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ItemCondition,
    description: 'Kondisi fisik unit perlengkapan',
    example: ItemCondition.LIKE_NEW,
  })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({
    description: 'Filter nama wilayah atau kota',
    example: 'Jakarta Selatan',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    enum: ProductSortBy,
    default: ProductSortBy.POPULAR,
    description: 'Urutan pengurutan data',
    example: ProductSortBy.POPULAR,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.POPULAR;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Halaman aktif' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12, description: 'Jumlah item per halaman' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}
