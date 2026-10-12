import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; 
import { MongooseModule } from '@nestjs/mongoose';
import { SellersModule } from './sellers/sellers.module';
import { OrdersModule } from './orders/orders.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/wApp'),
    SellersModule,
    OrdersModule,
    WhatsAppModule,
    
  ],
})
export class AppModule {}
