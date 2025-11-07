import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seller, SellerDocument, SellerSchema } from './schemas/sellers.schema';

@Injectable()
export class SellersService {
  constructor(@InjectModel(Seller.name) private sellerModel: Model<SellerDocument>) {}

  async updateCustomMessage(whatsappNumber: string, customMessage: string): Promise<Seller> {
    const seller = await this.sellerModel.findOneAndUpdate(
      { whatsappNumber },
      { customMessage },
      { new: true } // ✅ Return the updated document
    );

    if (!seller) {
      throw new Error(`Seller with WhatsApp number ${whatsappNumber} not found.`);
    }

    return seller;
  }

  async setProductMessage(whatsappNumber: string, productCode: string, message: string) {
    const seller = await this.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error(`Seller not found for WhatsApp number: ${whatsappNumber}`);
  
    await this.sellerModel.findOneAndUpdate(
      { whatsappNumber },
      { $set: { [`productMessages.${productCode}`]: message } },
      { new: true }
    );
    
  
    return { message: `Custom message for product ${productCode} set successfully.` };
  }
  
  async getProductMessage(whatsappNumber: string, productCode: string): Promise<{ productCode: string; message: string }> {
    const seller = await this.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error(`Seller not found for WhatsApp number: ${whatsappNumber}`);
  
    const message = seller.productMessages[productCode] || 'No custom message set for this product.';
    return { productCode, message };
  }
  
  async deleteProductMessage(whatsappNumber: string, productCode: string) {
    const seller = await this.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error(`Seller not found for WhatsApp number: ${whatsappNumber}`);
  
    await this.sellerModel.findOneAndUpdate(
      { whatsappNumber },
      { $unset: { [`productMessages.${productCode}`]: "" } },
      { new: true }
    );
    
  
    return { message: `Custom message for product ${productCode} deleted successfully.` };
  }
  

  async setCustomMessaging(whatsappNumber: string, isCustom: boolean) {
    const updatedSeller = await this.sellerModel.findOneAndUpdate(
      { whatsappNumber },
      { isCustom }, // ✅ Updates the isCustom field
      { new: true } // ✅ Returns the updated document
    );
  
    if (!updatedSeller) {
      throw new Error(`Seller with WhatsApp number ${whatsappNumber} not found.`);
    }
  
    return { message: `Custom messaging ${isCustom ? 'enabled' : 'disabled'} for seller ${whatsappNumber}.` };
  }
  

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
