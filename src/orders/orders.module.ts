import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SellersModule } from '../sellers/sellers.module'; // ✅ Import SellersModule
import { WhatsAppModule } from '../whatsapp/whatsapp.module'; // ✅ Import WhatsAppModule

@Module({
  imports: [SellersModule, WhatsAppModule], // ✅ Add SellersModule here
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
