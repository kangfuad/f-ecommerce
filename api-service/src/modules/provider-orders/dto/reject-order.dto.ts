import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrderDto {
  @ApiProperty({
    example: 'Unit sedang dalam jadwal perawatan sensor berkala di service center resmi.',
    description: 'Alasan penolakan pesanan oleh penyedia',
  })
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @IsString()
  reason: string;
}
