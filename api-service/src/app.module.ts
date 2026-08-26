import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { ProductsModule } from './modules/products/products.module';
import { ProviderOrdersModule } from './modules/provider-orders/provider-orders.module';
import { ProviderStoresModule } from './modules/provider-stores/provider-stores.module';
import { RegionsModule } from './modules/regions/regions.module';
import { RentalOrdersModule } from './modules/rental-orders/rental-orders.module';
import { StorageModule } from './modules/storage/storage.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Redis Cache Module with async factory & fallback
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('redis.host', 'localhost');
        const redisPort = configService.get<number>('redis.port', 6379);
        const redisPassword = configService.get<string | undefined>('redis.password');
        const redisDb = configService.get<number>('redis.db', 0);

        try {
          const store = await redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
              connectTimeout: 2000,
            },
            password: redisPassword || undefined,
            database: redisDb,
            ttl: 600000, // 10 minutes default
          });
          return { store };
        } catch (err) {
          console.warn('⚠️ Could not connect to Redis, falling back to memory cache.');
          return { ttl: 600000 };
        }
      },
    }),

    // Rate Limiting (Throttler)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttl', 60000),
          limit: configService.get<number>('throttler.limit', 100),
        },
      ],
    }),

    // Global Database & Storage
    PrismaModule,
    StorageModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    RentalOrdersModule,
    ProviderStoresModule,
    ProviderOrdersModule,
    RegionsModule,
    FaqsModule,
  ],
  providers: [
    // Global JWT Auth Guard (Public routes can be bypassed via @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Throttler Rate Limiter Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Standard Response Envelope Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Request Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global Standard Error Envelope Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
