import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('my-invoices')
  async getMyInvoices(@GetUser('id') customerId: string) {
    return this.invoicesService.findInvoicesByCustomer(customerId);
  }

  @Get(':id')
  async getInvoice(@Param('id') id: string) {
    return this.invoicesService.findInvoiceById(id);
  }
}
