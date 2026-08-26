import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RentalOrdersService } from './rental-orders.service';

@ApiTags('3. Modul Reservasi & Pesanan Penyewa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private rentalOrdersService: RentalOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Mengajukan Booking Sewa Baru',
    description:
      'Membuat draf reservasi sewa baru dengan unit terpilih, jadwal mulai & selesai sewa, titik temu, dan kontak pemesan. Status awal: PENDING_CONFIRMATION.',
  })
  @ApiResponse({ status: 201, description: 'Pengajuan booking berhasil dikirim ke penyedia sewa.' })
  @ApiResponse({ status: 400, description: 'Payload booking tidak valid.' })
  async createBooking(
    @CurrentUser('id') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    const result = await this.rentalOrdersService.createBooking(userId, createBookingDto);
    return {
      message: 'Pengajuan booking berhasil dikirim ke penyedia sewa.',
      data: result,
    };
  }
}
