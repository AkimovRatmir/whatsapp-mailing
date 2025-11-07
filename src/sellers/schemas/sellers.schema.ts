import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SellerDocument = Seller & Document;

@Schema()
export class Seller {
  @Prop({ required: true, unique: true })
  whatsappNumber: string;

  @Prop({ required: true })
  kaspiAuthToken: string;

  @Prop({ default: 'Hi {name}, thank you for your order!' })
  defaultMessage: string;

  @Prop({ default: false })
  isCustom: boolean;

  @Prop({ type: Map, of: String, default: {} })
  productMessages: Record<string, string>;

  @Prop({ default: 'Hi {name}, thank you for your order! Leave us a review!' })  // ✅ Added this
  customMessage: string;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);

