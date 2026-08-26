import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';

@ApiTags('6. Modul Media & File Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // Max 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Format berkas tidak didukung. Harap unggah berkas PDF, JPG, PNG, atau WEBP.',
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload Berkas ke Server Lokal (PDF / Gambar)',
    description:
      'Mengunggah berkas PDF Surat Perjanjian, Kwitansi, atau Foto Produk langsung ke penyimpanan server lokal (Local Storage) dan mengembalikan URL publik yang dapat diakses.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Berkas PDF atau Gambar (maksimal 10MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Berkas berhasil disimpan di server.' })
  @ApiResponse({ status: 400, description: 'Ukuran berkas melebihi batas atau format tidak valid.' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Berkas (file) wajib dilampirkan.');
    }

    const subfolder = file.mimetype === 'application/pdf' ? 'agreements' : 'images';
    const result = await this.storageService.saveFile(file, subfolder);

    return {
      message: 'Berkas berhasil disimpan di server lokal.',
      data: {
        filename: result.filename,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: result.size,
        url: result.url,
      },
    };
  }
}
