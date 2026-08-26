import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('1. Modul Profil Pengguna')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Mengambil Data Profil Pengguna',
    description: 'Mengambil data diri, profesi, domisili, dan kontak darurat akun yang sedang login.',
  })
  @ApiResponse({ status: 200, description: 'Profil pengguna berhasil diambil.' })
  @ApiResponse({ status: 401, description: 'Sesi otentikasi tidak valid.' })
  async getProfile(@CurrentUser('id') userId: string) {
    const profile = await this.usersService.getProfile(userId);
    return {
      message: 'Profil pengguna berhasil diambil.',
      data: profile,
    };
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Memperbarui Data Profil Pengguna',
    description: 'Memperbarui biodata lengkap, profesi, wilayah domisili, dan kontak darurat.',
  })
  @ApiResponse({ status: 200, description: 'Profil pengguna berhasil diperbarui.' })
  @ApiResponse({ status: 401, description: 'Sesi otentikasi tidak valid.' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const result = await this.usersService.updateProfile(userId, updateProfileDto);
    return {
      message: 'Profil pengguna berhasil diperbarui.',
      data: result,
    };
  }
}
