import { Controller, Post, Body, Patch, Param, Get, Delete } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Patch('custom-message')
  async updateCustomMessage(
    @Body() body: { whatsappNumber: string; customMessage: string },
  ) {
    return this.sellersService.updateCustomMessage(body.whatsappNumber, body.customMessage);
  }

  @Post('register')
  async registerSeller(@Body() body: { whatsappNumber: string; kaspiAuthToken: string }) {
    return this.sellersService.registerSeller(body.whatsappNumber, body.kaspiAuthToken);
  }

  // ✅ Enable/disable custom messages
  @Patch(':whatsappNumber/set-custom')
  async setCustomMessaging(
    @Param('whatsappNumber') whatsappNumber: string,
    @Body('isCustom') isCustom: boolean
  ) {
    return this.sellersService.setCustomMessaging(whatsappNumber, isCustom);
  }

  // ✅ Set a custom message for a product
  @Post(':whatsappNumber/products/:productCode')
  async setProductMessage(
    @Param('whatsappNumber') whatsappNumber: string,
    @Param('productCode') productCode: string,
    @Body('message') message: string
  ) {
    return this.sellersService.setProductMessage(whatsappNumber, productCode, message);
  }

  // ✅ Get the custom message for a product
  @Get(':whatsappNumber/products/:productCode')
  async getProductMessage(
    @Param('whatsappNumber') whatsappNumber: string,
    @Param('productCode') productCode: string
  ) {
    return this.sellersService.getProductMessage(whatsappNumber, productCode);
  }

  // ✅ Delete the custom message for a product
  @Delete(':whatsappNumber/products/:productCode')
  async deleteProductMessage(
    @Param('whatsappNumber') whatsappNumber: string,
    @Param('productCode') productCode: string
  ) {
    return this.sellersService.deleteProductMessage(whatsappNumber, productCode);
  }
}

