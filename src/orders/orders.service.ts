import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SellersService } from '../sellers/sellers.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly sellersService: SellersService,
    private readonly whatsappService: WhatsAppService // ✅ Inject WhatsAppService
  ) {}

  // ✅ Fetch today's orders from Kaspi API
  async getTodayOrders(whatsappNumber: string) {
    const seller = await this.sellersService.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error("Seller not registered");
  
    const authToken = seller.kaspiAuthToken;
  
    // ✅ Use the correct Kaspi API headers
    const headers = {
      'X-Auth-Token': authToken,
      'Content-Type': 'application/vnd.api+json'
    };
  
    // ✅ Ensure the API request uses the correct date format
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();
  
    // ✅ Added required state filter `[orders][state][$eq]=KASPI_DELIVERY`
    const url = `https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=100&filter[orders][creationDate][$ge]=${startOfDay}&filter[orders][creationDate][$le]=${endOfDay}&filter[orders][state]=KASPI_DELIVERY`;
  
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("❌ Kaspi API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch orders from Kaspi API.");
    }
  }
  
  async sendMessagesForAllSellers() {
    const sellers = await this.sellersService.getAllSellers();
  
    if (!sellers || sellers.length === 0) {
      console.log("⚠️ No sellers found in the database.");
      return;
    }
  
    for (const seller of sellers) {
      try {
        console.log(`📩 Processing seller: ${seller.whatsappNumber}...`);
        await this.sendOrderMessages(seller.whatsappNumber);
        console.log(`✅ Messages sent for seller ${seller.whatsappNumber}`);
      } catch (error) {
        console.error(`❌ Failed to send messages for ${seller.whatsappNumber}:`, error.message);
      }
    }
  }
  

  // ✅ Send WhatsApp messages to all customers from today's orders
  async sendOrderMessages(whatsappNumber: string) {
    const orders = await this.getTodayOrders(whatsappNumber);
  
    if (!orders || !orders.data || orders.data.length === 0) {
      console.log(`⚠️ No orders found for seller ${whatsappNumber}.`);
      return;
    }
  
    for (const order of orders.data) {
      try {
        if (!order.attributes.customer || !order.attributes.customer.cellPhone) {
          console.log(`⚠️ Skipping order ${order.id}, missing customer phone.`);
          continue;
        }
  
        const customerPhone = order.attributes.customer.cellPhone;
        const customerName = order.attributes.customer.firstName || "Customer";
  
        console.log(`📩 Sending WhatsApp message from ${whatsappNumber} to ${customerPhone}...`);
  
        await this.whatsappService.sendMessage(
          whatsappNumber, // ✅ Send from seller's WhatsApp session
          customerPhone,
          `Hi ${customerName}, thank you for your order! Leave us a review!`
        );
  
        console.log(`✅ Message sent to ${customerPhone} from ${whatsappNumber}`);
      } catch (error) {
        console.error(`❌ Failed to send message for order ${order.id}:`, error.message);
      }
    }
  }
  
}
