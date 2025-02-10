import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Module({
  providers: [WhatsAppService],
  exports: [WhatsAppService], // ✅ Make sure this is here!
})
export class WhatsAppModule {}

