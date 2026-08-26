import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderStoreGuard } from '../../common/guards/provider-store.guard';
import { ProviderReviewTenantDto } from './dto/provider-review-tenant.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { ProviderOrdersService } from './provider-orders.service';

@ApiTags('4. Modul Panel Mitra Penyedia Sewa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProviderStoreGuard)
@Controller('provider/orders')
export class ProviderOrdersController {
  constructor(private providerOrdersService: ProviderOrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Mengambil Timeline Pesanan Masuk Toko Penyedia',
    description:
      'Mengambil seluruh daftar pesanan booking yang masuk ke lapak mitra penyedia, dikelompokkan dalam timeline antrean.',
  })
  @ApiResponse({ status: 200, description: 'Data timeline penyedia berhasil diambil.' })
  @ApiResponse({ status: 403, description: 'Hanya dapat diakses oleh Mitra Penyedia Sewa.' })
  async getTimelineOrders(@CurrentUser('id') userId: string) {
    const data = await this.providerOrdersService.getTimelineOrders(userId);
    return {
      message: 'Data timeline penyedia berhasil diambil.',
      data,
    };
  }

  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menerima & Mengonfirmasi Pesanan Booking (Accept Booking)',
    description: 'Penyedia menyetujui booking dan mengubah status pesanan menjadi CONFIRMED.',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Pesanan diterima dan jadwal temu dikonfirmasi.' })
  async confirmOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    const result = await this.providerOrdersService.confirmOrder(userId, orderId);
    return {
      message: 'Pesanan diterima dan jadwal temu dikonfirmasi.',
      data: result,
    };
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menolak Pesanan Booking (Reject Booking)',
    description: 'Penyedia menolak pesanan booking disertai alasan penolakan (rejectionReason).',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Pesanan berhasil ditolak.' })
  async rejectOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() rejectDto: RejectOrderDto,
  ) {
    const result = await this.providerOrdersService.rejectOrder(userId, orderId, rejectDto);
    return {
      message: 'Pesanan berhasil ditolak.',
      data: result,
    };
  }

  @Post(':id/upload-documents')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'signedAgreementFile', maxCount: 1 },
      { name: 'paymentBillFile', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Mengunggah Berkas Perjanjian Sewa TTD & Bukti Kuitansi Pembayaran',
    description:
      'Mengunggah file PDF / Foto Surat Perjanjian Sewa (SP-EPS) bertandatangan dan bukti kuitansi pembayaran. Status pesanan berubah menjadi ACTIVE_RENTAL.',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Dokumen perjanjian dan bukti pembayaran berhasil diunggah.' })
  async uploadDocuments(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @UploadedFiles()
    files: {
      signedAgreementFile?: Express.Multer.File[];
      paymentBillFile?: Express.Multer.File[];
    },
  ) {
    const result = await this.providerOrdersService.uploadDocuments(userId, orderId, files || {});
    return {
      message: 'Dokumen perjanjian dan bukti pembayaran berhasil diunggah.',
      data: result,
    };
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menyelesaikan Masa Sewa Unit (Complete Rental)',
    description:
      'Menutup transaksi sewa secara resmi setelah masa sewa berakhir dan unit dikembalikan dalam kondisi normal. Status berubah menjadi COMPLETED.',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Masa sewa selesai dan transaksi berhasil ditutup.' })
  async completeOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    const result = await this.providerOrdersService.completeOrder(userId, orderId);
    return {
      message: 'Masa sewa selesai dan transaksi berhasil ditutup.',
      data: result,
    };
  }

  @Post(':id/review-tenant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Penyedia Memberikan Ulasan Reputasi Penyewa',
    description:
      'Penyedia sewa memberikan penilaian integritas penyewa (ketepatan waktu pengembalian, kebersihan unit, dan komunikasi).',
  })
  @ApiParam({ name: 'id', description: 'Nomor Order ID (contoh: EPS-20260826-8901)' })
  @ApiResponse({ status: 200, description: 'Ulasan reputasi penyewa berhasil disimpan.' })
  async reviewTenant(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() reviewDto: ProviderReviewTenantDto,
  ) {
    const result = await this.providerOrdersService.reviewTenant(userId, orderId, reviewDto);
    return {
      message: 'Ulasan reputasi penyewa berhasil disimpan.',
      data: result,
    };
  }
}
