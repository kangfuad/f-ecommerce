import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProviderReviewTenantDto {
  @ApiProperty({
    example: 5,
    description: 'Rating reputasi penyewa dari skala 1 sampai 5',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Penyewa sangat amanah, tepat waktu saat jadwal temu, dan unit kembali dalam kondisi bersih prima.',
    description: 'Catatan ulasan integritas penyewa',
  })
  @IsNotEmpty({ message: 'Ulasan wajib diisi' })
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    example: ['Pengembalian Tepat Waktu', 'Unit Terawat Sangat Baik'],
    description: 'Badges reputasi positif',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];
}
