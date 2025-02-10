import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private clients: Map<string, Client> = new Map(); // ✅ Stores sessions per seller

  async onModuleInit() {
    console.log("WhatsApp Service Initialized");
  }

  async initializeWhatsAppSession(sellerPhoneNumber: string) {
    if (this.clients.has(sellerPhoneNumber)) {
      console.log(`WhatsApp session for ${sellerPhoneNumber} is already initialized.`);
      return this.clients.get(sellerPhoneNumber);
    }

    console.log(`Initializing WhatsApp session for ${sellerPhoneNumber}...`);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: sellerPhoneNumber }), // ✅ Unique session for each seller
    });

    client.on('qr', qr => {
      console.log(`Scan this QR code for seller ${sellerPhoneNumber}:`);
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log(`WhatsApp bot is ready for ${sellerPhoneNumber}!`);
    });

    client.on('disconnected', () => {
      console.log(`WhatsApp session for ${sellerPhoneNumber} disconnected.`);
      this.clients.delete(sellerPhoneNumber);
    });

    await client.initialize();
    this.clients.set(sellerPhoneNumber, client);
    return client;
  }

  async sendMessage(sellerPhoneNumber: string, customerPhoneNumber: string, message: string) {
    const client = await this.initializeWhatsAppSession(sellerPhoneNumber);
  
    if (!client) {
      throw new Error(`No active WhatsApp session found for ${sellerPhoneNumber}.`);
    }
  
    const chatId = `${customerPhoneNumber}@c.us`;
  
    let attempts = 0;
    const maxRetries = 3; // Retry up to 3 times if it fails
  
    while (attempts < maxRetries) {
      try {
        console.log(`Attempt ${attempts + 1}: Sending message from ${sellerPhoneNumber} to ${customerPhoneNumber}...`);
        await client.sendMessage(chatId, message);
        console.log(`Message sent successfully to ${customerPhoneNumber} from ${sellerPhoneNumber}`);
        return; // Exit the loop if the message is sent successfully
      } catch (error) {
        console.error(`Error sending message: ${error.message}`);
  
        if (attempts === maxRetries - 1) {
          console.error(`Failed after ${maxRetries} attempts.`);
        } else {
          console.log(`Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
        }
      }
  
      attempts++;
    }
  }
  
}
