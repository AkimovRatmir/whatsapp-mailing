import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });

    // Handle QR code generation
    this.client.on('qr', qr => {
      console.log('Scan this QR code with WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Notify when the bot is ready
    this.client.on('ready', () => {
      console.log('WhatsApp bot is ready!');
    });
  }

  // Add this method to fix the error
  async onModuleInit() {
    console.log("Initializing WhatsApp Client...");
    await this.client.initialize();
  }

  async sendMessage(phone: string, message: string) {
    const chatId = `${phone}@c.us`; // WhatsApp format
    await this.client.sendMessage(chatId, message);
    return `Message sent to ${phone}`;
  }
}
