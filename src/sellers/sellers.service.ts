import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seller, SellerDocument } from './schemas/sellers.schema';

@Injectable()
export class SellersService {
  constructor(@InjectModel(Seller.name) private sellerModel: Model<SellerDocument>) {}

  async registerSeller(whatsappNumber: string, kaspiAuthToken: string): Promise<Seller> {
    const seller = new this.sellerModel({ whatsappNumber, kaspiAuthToken });
    return seller.save();
  }

  async getAllSellers() {
    return this.sellerModel.find().exec();
  }
  

  async findSellerByWhatsApp(whatsappNumber: string): Promise<Seller | null> {
    return this.sellerModel.findOne({ whatsappNumber }).exec();
  }
}
