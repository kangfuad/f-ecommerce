import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ExtendOrderDto {
  @ApiProperty({
    example: 2,
    description: 'Jumlah hari penambahan masa sewa',
  })
  @IsInt({ message: 'Jumlah hari perpanjangan harus bilangan bulat positif' })
  @Min(1, { message: 'Minimal perpanjangan adalah 1 hari' })
  additionalDays: number;

  @ApiPropertyOptional({
    example: 'Jadwal produksi shooting komersial mundur 2 hari.',
    description: 'Catatan alasan perpanjangan',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
