import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating bintang dari skala 1 sampai 5',
  })
  @IsInt()
  @Min(1, { message: 'Rating minimal 1 bintang' })
  @Max(5, { message: 'Rating maksimal 5 bintang' })
  rating: number;

  @ApiProperty({
    example: 'Unit drone sangat prima, baterai full, dan pelayanan ramah!',
    description: 'Ulasan atau testimoni pengalaman rental',
  })
  @IsNotEmpty({ message: 'Komentar ulasan wajib diisi' })
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    example: ['Unit Bersih', 'Pelayanan Cepat', 'Sangat Direkomendasikan'],
    description: 'Daftar tag / badge testimoni positif',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
