import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { fullName: true, email: true, phone: true, address: true } },
            car: { select: { make: true, model: true, registrationNumber: true } },
            services: { include: { service: true } },
          },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found.');
    return invoice;
  }

  async findInvoicesByCustomer(customerId: string) {
    return this.prisma.invoice.findMany({
      where: { booking: { customerId } },
      include: {
        booking: { select: { bookingReference: true, car: { select: { make: true, model: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
