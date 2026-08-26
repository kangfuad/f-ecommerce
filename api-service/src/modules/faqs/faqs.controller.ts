import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FaqsService } from './faqs.service';

@ApiTags('5. Modul Wilayah & Data Master')
@Controller('faqs')
export class FaqsController {
  constructor(private faqsService: FaqsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Pusat Bantuan & FAQ Prosedur Sewa',
    description:
      'Mengambil daftar tanya-jawab resmi alur booking, serah terima, ketentuan QC, dan tanggung jawab unit rental.',
  })
  @ApiResponse({ status: 200, description: 'Data FAQ berhasil diambil.' })
  findAll() {
    const data = this.faqsService.findAll();
    return {
      message: 'Data FAQ berhasil diambil.',
      data,
    };
  }
}
