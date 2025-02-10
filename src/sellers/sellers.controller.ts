import { Controller, Post, Body } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('register')
  async registerSeller(@Body() body: { whatsappNumber: string; kaspiAuthToken: string }) {
    return this.sellersService.registerSeller(body.whatsappNumber, body.kaspiAuthToken);
  }
}
