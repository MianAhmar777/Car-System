import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async processPayment(
    @GetUser('id') userId: string,
    @Body() body: { bookingId: string; amount: number; provider?: string; transactionId?: string },
  ) {
    return this.paymentsService.processPayment(userId, body);
  }

  @Post('bank-transfer')
  @UseInterceptors(FileInterceptor('slip'))
  async processBankTransfer(
    @GetUser('id') userId: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.paymentsService.processBankTransfer(userId, body, file);
  }

  @Get('booking/:bookingId')
  async getPayments(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getBookingPayments(bookingId);
  }
}

