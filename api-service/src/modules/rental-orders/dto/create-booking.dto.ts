import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetupLocationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingItemDto {
  @ApiProperty({ example: 'eps_drone_01' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;

  @ApiProperty({ example: '2026-08-27' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-30' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  rentalDays: number;

  @ApiProperty({ example: 550000 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositRate?: number;

  @ApiProperty({ example: 1650000 })
  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class MeetupDetailsDto {
  @ApiProperty({
    enum: MeetupLocationType,
    example: MeetupLocationType.PROVIDER_HUB,
    default: MeetupLocationType.PROVIDER_HUB,
  })
  @IsEnum(MeetupLocationType)
  locationType: MeetupLocationType = MeetupLocationType.PROVIDER_HUB;

  @ApiProperty({ example: 'Hub Gandaria Jakarta Selatan' })
  @IsNotEmpty()
  @IsString()
  locationName: string;

  @ApiProperty({
    example: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
  })
  @IsNotEmpty()
  @IsString()
  locationAddress: string;

  @ApiProperty({ example: '2026-08-27' })
  @IsDateString()
  scheduleDate: string;

  @ApiProperty({ example: '09:00 WIB' })
  @IsNotEmpty()
  @IsString()
  scheduleTime: string;

  @ApiPropertyOptional({ example: 'Uji fungsi dan tanda tangan surat perjanjian.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CustomerContactDto {
  @ApiProperty({ example: 'Auri Fuad' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '081234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'auri.fuad@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: 'Jl. Gandaria 1 No. 12, Kebayoran Baru' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}

export class CreateBookingDto {
  @ApiProperty({ type: [BookingItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal harus memesan 1 unit produk' })
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];

  @ApiProperty({ type: MeetupDetailsDto })
  @ValidateNested()
  @Type(() => MeetupDetailsDto)
  meetup: MeetupDetailsDto;

  @ApiPropertyOptional({ type: CustomerContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerContactDto)
  customer?: CustomerContactDto;

  @ApiPropertyOptional({
    example: 'Digunakan untuk syuting aerial proyek komersial.',
  })
  @IsOptional()
  @IsString()
  bookingNotes?: string;
}
