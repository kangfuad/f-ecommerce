import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('1. Modul Autentikasi')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login Kredensial Pengguna',
    description:
      'Validasi identitas (email / WhatsApp) dan password, mengembalikan token JWT serta status kepemilikan lapak mitra (hasProviderStore).',
  })
  @ApiResponse({ status: 200, description: 'Login berhasil.' })
  @ApiResponse({ status: 401, description: 'Identitas atau kata sandi tidak valid.' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'Login berhasil.',
      data: result,
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrasi Akun Penyewa Baru',
    description: 'Mendaftarkan akun penyewa baru dengan nama lengkap, nomor WhatsApp, email, dan password.',
  })
  @ApiResponse({ status: 201, description: 'Pendaftaran akun berhasil.' })
  @ApiResponse({ status: 409, description: 'Email atau nomor telepon sudah terdaftar.' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      message: 'Pendaftaran akun berhasil.',
      data: result,
    };
  }
}
