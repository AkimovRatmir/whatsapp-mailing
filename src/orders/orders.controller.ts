import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Fetch today's orders from Kaspi API
  @Get('today')
  async getTodayOrders(@Query('whatsappNumber') whatsappNumber: string) {
    return this.ordersService.getTodayOrders(whatsappNumber);
  }

  @Post('send-messages-all')
  async sendMessagesForAllSellers() {
    return this.ordersService.sendMessagesForAllSellers();
  }

  // Send WhatsApp messages to customers
  @Post('send-messages')
  async sendOrderMessages(@Body() body: { whatsappNumber: string }) {
    return this.ordersService.sendOrderMessages(body.whatsappNumber);
  }

  @Post('send-messages-all-hours')
  async sendMessagesForCurrentHour() {
    return this.ordersService.sendMessagesForAllSellersForCurrentHour();
  }

  @Post('test-hourly-task')
async testHourlyTask() {
  await this.ordersService.handleHourlyTask();
  return { message: 'Hourly task triggered manually.' };
}

}
