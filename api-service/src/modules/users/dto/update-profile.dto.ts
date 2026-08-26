import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Auri Fuad' })
  @IsOptional()
  @IsString()
  @Length(3, 150)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Auri Fuad' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^08[0-9]{8,13}$/, {
    message: 'Nomor telepon harus valid diawali 08',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'Sinematografer & Produser' })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({ example: 'Cinema Works Asia' })
  @IsOptional()
  @IsString()
  companyOrStudio?: string;

  @ApiPropertyOptional({ example: '@aurifilm' })
  @IsOptional()
  @IsString()
  socialMediaInstagram?: string;

  @ApiPropertyOptional({ example: '31' })
  @IsOptional()
  @IsString()
  provinceId?: string;

  @ApiPropertyOptional({ example: 'DKI JAKARTA' })
  @IsOptional()
  @IsString()
  provinceName?: string;

  @ApiPropertyOptional({ example: '3171' })
  @IsOptional()
  @IsString()
  regencyId?: string;

  @ApiPropertyOptional({ example: 'KOTA JAKARTA SELATAN' })
  @IsOptional()
  @IsString()
  regencyName?: string;

  @ApiPropertyOptional({ example: '3171060' })
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional({ example: 'KEBAYORAN BARU' })
  @IsOptional()
  @IsString()
  districtName?: string;

  @ApiPropertyOptional({ example: '3171060008' })
  @IsOptional()
  @IsString()
  villageId?: string;

  @ApiPropertyOptional({ example: 'SELONG' })
  @IsOptional()
  @IsString()
  villageName?: string;

  @ApiPropertyOptional({
    example: 'Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Jl. Gandaria 1 No. 12' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '12190' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Rina Fuad' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '081298765432' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'Pasangan' })
  @IsOptional()
  @IsString()
  emergencyRelation?: string;

  @ApiPropertyOptional({
    example: 'Fokus pada rental perlengkapan kamera bioskop dan drone berlisensi.',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
