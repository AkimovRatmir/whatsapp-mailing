import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SellersService } from '../sellers/sellers.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
  constructor(
    private readonly sellersService: SellersService,
    private readonly whatsappService: WhatsAppService // Inject WhatsAppService
  ) {}

  // Fetch today's orders from Kaspi API
  async getTodayOrders(whatsappNumber: string) {
    const seller = await this.sellersService.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error("Seller not registered");
  
    const authToken = seller.kaspiAuthToken;
  
    // Use the correct Kaspi API headers
    const headers = {
      'X-Auth-Token': authToken,
      'Content-Type': 'application/vnd.api+json'
    };
  
    // Ensure the API request uses the correct date format
    const today = new Date();
    const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999)).getTime();

   
    // Added required state filter `[orders][state][$eq]=KASPI_DELIVERY`
    const url = `https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=100&filter[orders][creationDate][$ge]=${startOfDay}&filter[orders][creationDate][$le]=${endOfDay}&filter[orders][state]=KASPI_DELIVERY`;
  
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Kaspi API Error:", error.response?.data || error.message);
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
        console.log(`Processing seller: ${seller.whatsappNumber}...`);
        await this.sendOrderMessages(seller.whatsappNumber);
        console.log(`Messages sent for seller ${seller.whatsappNumber}`);
      } catch (error) {
        console.error(`Failed to send messages for ${seller.whatsappNumber}:`, error.message);
      }
    }
  }
  

  // Send WhatsApp messages to all customers from today's orders
  async sendOrderMessages(whatsappNumber: string) {
    const seller = await this.sellersService.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error(`Seller with WhatsApp number ${whatsappNumber} not found.`);
  
    const authToken = seller.kaspiAuthToken; // ✅ Ensure auth token is used for every request
  
    const orders = await this.getTodayOrders(whatsappNumber);
  
    if (!orders || !orders.data || orders.data.length === 0) {
      console.log(`⚠️ No orders found for seller ${whatsappNumber}.`);
      return;
    }
  
    for (const order of orders.data) {
      if (!order.attributes.customer || !order.attributes.customer.cellPhone) {
        console.log(`⚠️ Skipping order ${order.id}, missing customer phone.`);
        continue;
      }
  
      let customerPhone = order.attributes.customer.cellPhone;
      if (customerPhone.length < 10) {
        customerPhone = `7${customerPhone}`;
      }
  
      const customerName = order.attributes.customer.firstName || 'Customer';
  
      // ✅ Default to seller's general custom message
      let messageTemplate = seller.customMessage || 'Hi {name}, thank you for your order! Leave us a review!';
  
      if (seller.isCustom) {
        try {
          // ✅ Step 1: Get the entries URL from the order response
          const entriesUrl = order.relationships.entries?.links.related;
          if (!entriesUrl) {
            console.log(`⚠️ No entries link found for order ${order.id}`);
            continue;
          }
  
          // ✅ Step 2: Fetch product entries (with Auth Token)
          const entriesResponse = await axios.get(entriesUrl, {
            headers: { 
              'X-Auth-Token': authToken, 
              'Content-Type': 'application/vnd.api+json' 
            }
          });
  
          const productLinks = entriesResponse.data.data.map(entry => entry.relationships?.product?.links?.related);
  
          if (!productLinks || productLinks.length === 0) {
            console.log(`⚠️ No product links found for order ${order.id}`);
            continue;
          }
  
          for (const productUrl of productLinks) {
            if (!productUrl) continue;
  
            // ✅ Step 3: Fetch the actual product details (with Auth Token)
            const productResponse = await axios.get(productUrl, {
              headers: { 
                'X-Auth-Token': authToken, 
                'Content-Type': 'application/vnd.api+json' 
              }
            });
  
            const productCode = productResponse.data.data.attributes.code;
            console.log(`✅ Found product code: ${productCode}`);
  
            // ✅ Step 4: Check for custom product message
            if (seller.productMessages && seller.productMessages[productCode]) {
              messageTemplate = seller.productMessages[productCode]; // ✅ Use product message
              break;
            }
          }
        } catch (error) {
          console.error(`⚠️ Error fetching product details:`, error.response?.data || error.message);
        }
      }
  
      // ✅ Replace `{name}` with the customer's name
      const message = messageTemplate.replace('{name}', customerName);
  
      console.log(`📩 Sending WhatsApp message from ${whatsappNumber} to ${customerPhone}...`);
      await this.whatsappService.sendMessage(seller.whatsappNumber, customerPhone, message);
      console.log(`✅ Message sent to ${customerPhone} from ${whatsappNumber}`);
    }
  }
  
   

  // Fetch current hour orders from Kaspi API
  async getCurrentHourOrders(whatsappNumber: string) {
    const seller = await this.sellersService.findSellerByWhatsApp(whatsappNumber);
    if (!seller) throw new Error(`Seller with WhatsApp number ${whatsappNumber} not found.`);

    const authToken = seller.kaspiAuthToken;

    const headers = {
      'X-Auth-Token': authToken,
      'Content-Type': 'application/vnd.api+json',
    };

    const now = new Date(); 
    const startOfHour = new Date(now.setMinutes(0, 0, 0)).getTime(); // Start of the current hour
    const endOfHour = new Date(now.setMinutes(59, 59, 999)).getTime(); // End of the current hour

    console.log('Current hour time range:');
    console.log(`Start of hour: ${new Date(startOfHour).toISOString()}`);
    console.log(`End of hour: ${new Date(endOfHour).toISOString()}`);
    
    const url = `https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=100&filter[orders][creationDate][$ge]=${startOfHour}&filter[orders][creationDate][$le]=${endOfHour}&filter[orders][state]=KASPI_DELIVERY`;

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Kaspi API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch orders from Kaspi API.');
    }
  }

  // Send WhatsApp messages to all customers for the current hour
  async sendMessagesForAllSellersForCurrentHour() {
    const sellers = await this.sellersService.getAllSellers();

    if (!sellers || sellers.length === 0) {
      console.log('⚠️ No sellers found in the database.');
      return;
    }

    for (const seller of sellers) {
      try {
        console.log(`Processing seller: ${seller.whatsappNumber}...`);
        const orders = await this.getCurrentHourOrders(seller.whatsappNumber);

        if (!orders || !orders.data || orders.data.length === 0) {
          console.log(`⚠️ No orders for the current hour for seller ${seller.whatsappNumber}.`);
          continue;
        }

        for (const order of orders.data) {
          if (!order.attributes.customer || !order.attributes.customer.cellPhone) {
            console.log(`⚠️ Skipping order ${order.id}, missing customer phone.`);
            continue;
          }

          let customerPhone = order.attributes.customer.cellPhone;
          if (customerPhone.length <= 10) {
            customerPhone = `7${customerPhone}`;
          }

          const customMessage = seller.customMessage || 'Hi {name}, thank you for your order! Leave us a review!';
          const customerName = order.attributes.customer.firstName || 'Customer';
          const message = customMessage.replace('{name}', customerName);

          await this.whatsappService.sendMessage(seller.whatsappNumber, customerPhone, message);
          console.log(`Message sent to ${customerPhone} from ${seller.whatsappNumber}`);
        }
      } catch (error) {
        console.error(`Failed to send messages for seller ${seller.whatsappNumber}:`, error.response?.data || error.message);
      }
    }
  }

  // Automatically trigger every hour
  @Cron('0 * * * *') // Run every minute
  async handleHourlyTask() {
    console.log('⏰ Running task to send messages for current minute orders...');
    try {
      await this.sendMessagesForAllSellersForCurrentHour(); // Still uses current hour logic for simplicity
      console.log('Task completed successfully!');
    } catch (error) {
      console.error('Task failed:', error.message);
    }
  }
  
}
