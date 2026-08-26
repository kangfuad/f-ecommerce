import { Module } from '@nestjs/common';
import { ProviderOrdersController } from './provider-orders.controller';
import { ProviderOrdersService } from './provider-orders.service';

@Module({
  controllers: [ProviderOrdersController],
  providers: [ProviderOrdersService],
  exports: [ProviderOrdersService],
})
export class ProviderOrdersModule {}
