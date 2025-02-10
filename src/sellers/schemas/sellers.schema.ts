import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SellerDocument = Seller & Document;

@Schema()
export class Seller {
  @Prop({ required: true, unique: true })
  whatsappNumber: string;

  @Prop({ required: true })
  kaspiAuthToken: string;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
