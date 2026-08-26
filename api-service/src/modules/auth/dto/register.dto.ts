import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap sesuai KTP',
  })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  @Length(3, 150, { message: 'Nama lengkap harus antara 3 - 150 karakter' })
  fullName: string;

  @ApiProperty({
    example: 'budi.santoso@example.com',
    description: 'Alamat email aktif',
  })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: '081399887766',
    description: 'Nomor WhatsApp aktif untuk koordinasi serah terima',
  })
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsString()
  @Matches(/^08[0-9]{8,13}$/, {
    message: 'Nomor telepon harus diawali 08 dan memiliki panjang 10-15 digit',
  })
  phone: string;

  @ApiProperty({
    example: 'PasswordKuat123!',
    description: 'Kata sandi akun minimal 6 karakter',
  })
  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;
}
