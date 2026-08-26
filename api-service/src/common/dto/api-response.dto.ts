import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: 50 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

export class ResponseMetaDto {
  @ApiProperty({ example: '2026-08-26T12:00:00.000Z' })
  timestamp: string;

  @ApiPropertyOptional({ type: PaginationMetaDto })
  pagination?: PaginationMetaDto;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 'success', enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiProperty({ example: 'Operasi berhasil diproses.' })
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ type: ResponseMetaDto })
  meta: ResponseMetaDto;
}
