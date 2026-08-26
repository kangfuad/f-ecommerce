import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { OrdersController } from './orders.controller';
import { RentalOrdersService } from './rental-orders.service';

@Module({
  controllers: [BookingsController, OrdersController],
  providers: [RentalOrdersService],
  exports: [RentalOrdersService],
})
export class RentalOrdersModule {}
