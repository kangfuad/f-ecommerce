import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ExtendOrderDto } from './dto/extend-order.dto';
import { RentalOrdersService } from './rental-orders.service';

@ApiTags('3. Modul Reservasi & Pesanan Penyewa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private rentalOrdersService: RentalOrdersService) {}

  @Get('my-orders')
  @ApiOperation({
    summary: 'Mengambil Riwayat Pesanan Penyewa (My Orders)',
    description:
      'Mengambil daftar seluruh transaksi booking yang diajukan oleh penyewa yang sedang login, dengan filter tab status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED'],
    description: 'Filter status pesanan',
  })
  @ApiResponse({ status: 200, description: 'Riwayat pesanan berhasil diambil.' })
  async getMyOrders(
    @CurrentUser('id') userId: string,
    @Query('status') statusFilter?: string,
  ) {
    const orders = await this.rentalOrdersService.getMyOrders(userId, statusFilter);
    return {
      message: 'Riwayat pesanan berhasil diambil.',
      data: orders,
    };
  }

  @Post(':id/extend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mengajukan Perpanjangan Durasi Sewa (+N Hari)',
    description:
      'Memperpanjang masa sewa unit yang sedang aktif. Sistem mengkalkulasi ulang tanggal selesai dan total biaya tambahan.',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Pengajuan perpanjangan berhasil dikirim.' })
  @ApiResponse({ status: 400, description: 'Status order tidak memenuhi syarat perpanjangan.' })
  async extendOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() extendOrderDto: ExtendOrderDto,
  ) {
    const result = await this.rentalOrdersService.extendOrder(userId, orderId, extendOrderDto);
    return {
      message: 'Pengajuan perpanjangan berhasil dikirim.',
      data: result,
    };
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Penyewa Memberi Ulasan & Rating untuk Mitra Penyedia',
    description:
      'Penyewa memberikan rating bintang (1-5) dan review pelayanan mitra sewa setelah masa sewa selesai.',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Ulasan berhasil dikirim.' })
  @ApiResponse({ status: 409, description: 'Anda sudah memberikan ulasan untuk pesanan ini.' })
  async createReview(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const result = await this.rentalOrdersService.createTenantReview(
      userId,
      orderId,
      createReviewDto,
    );
    return {
      message: 'Ulasan berhasil dikirim.',
      data: result,
    };
  }
}
