import { Module } from '@nestjs/common';
import { ProviderStoresController } from './provider-stores.controller';
import { ProviderStoresService } from './provider-stores.service';

@Module({
  controllers: [ProviderStoresController],
  providers: [ProviderStoresService],
  exports: [ProviderStoresService],
})
export class ProviderStoresModule {}
