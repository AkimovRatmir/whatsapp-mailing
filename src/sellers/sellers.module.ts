import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Seller, SellerSchema } from './schemas/sellers.schema'; 
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Seller.name, schema: SellerSchema }])],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService], // ✅ Make sure this is here!
})
export class SellersModule {}

