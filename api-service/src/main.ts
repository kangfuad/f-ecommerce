import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const apiPrefix = configService.get<string>('apiPrefix', 'api/v1');

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static files for uploaded agreements and bills
  const uploadDir = path.resolve(
    configService.get<string>('storage.uploadDir', './uploads'),
  );
  app.use('/uploads', express.static(uploadDir));

  // Set Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('e-punyasewa RESTful API')
    .setDescription(
      'Spesifikasi API Backend Komprehensif untuk Platform Informasi & Reservasi Sewa Perlengkapan Modern (e-punyasewa). Mendukung alur booking terpadu, konfirmasi jadwal temu, serah terima berkas perjanjian TTD, kuitansi pembayaran, dan reputasi 2 arah.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan JWT Access Token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('1. Modul Autentikasi', 'Registrasi dan login kredensial pengguna')
    .addTag('1. Modul Profil Pengguna', 'Data diri, profesi, domisili, dan kontak darurat')
    .addTag('2. Modul Katalog Produk', 'Daftar produk, multi-filter, search, dan detail unit')
    .addTag('2. Modul Kategori Produk', 'Daftar kategori unit perlengkapan sewa')
    .addTag('3. Modul Reservasi & Pesanan Penyewa', 'Submit booking, riwayat pesanan, perpanjangan, dan ulasan')
    .addTag('4. Modul Panel Mitra Penyedia Sewa', 'Manajemen pesanan toko, konfirmasi, upload dokumen SP-EPS/bill, dan ulasan reputasi penyewa')
    .addTag('5. Modul Wilayah & Data Master', 'Cascading wilayah administratif Indonesia dan FAQ pusat bantuan')
    .addTag('6. Modul Media & File Upload', 'Penyimpanan berkas foto dan dokumen PDF di server lokal')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'e-punyasewa API Documentation',
  });

  await app.listen(port);
  logger.log(`🚀 API Service running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
