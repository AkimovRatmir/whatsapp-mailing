import { Controller, Post, Body } from '@nestjs/common';
import { WhatsAppService } from './msg.servise';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  async sendMessage(@Body() body: { phone: string; message: string }) {
    return this.whatsappService.sendMessage(body.phone, body.message);
  }
}
