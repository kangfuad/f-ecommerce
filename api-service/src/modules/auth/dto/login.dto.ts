import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'auri.fuad@example.com',
    description: 'Email atau nomor telepon (WhatsApp) terdaftar',
  })
  @IsNotEmpty({ message: 'Identitas login (email/telepon) wajib diisi' })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'PasswordRahasia123!',
    description: 'Kata sandi akun',
  })
  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;
}
