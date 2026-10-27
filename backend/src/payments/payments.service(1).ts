import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';
import { PaymentStatus } from '@prisma/client';
import * as path from 'path';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private storageService: StorageService,
  ) {}

  async processPayment(
    userId: string,
    data: { bookingId: string; amount: number; provider?: string; transactionId?: string; receiptUrl?: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { payments: true, invoices: true },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    const paymentMethod = data.provider || 'CREDIT_CARD';
    let defaultTxnId = `TXN-${Date.now()}`;
    if (paymentMethod === 'CASH') {
      defaultTxnId = `COD-${Date.now()}`;
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        amount: Number(data.amount),
        currency: 'PKR',
        provider: paymentMethod,
        providerTransactionId: data.transactionId || defaultTxnId,
        status: 'SUCCESS',
        paymentDate: new Date(),
      },
    });

    // Update booking and invoice payment status
    const totalPaid =
      booking.payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0) + Number(data.amount);

    const isFullyPaid = totalPaid >= booking.totalAmount;
    const newStatus: PaymentStatus = isFullyPaid ? 'SUCCESS' : 'PROCESSING';

    await this.prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        paymentStatus: newStatus,
        status: booking.status === 'PENDING' ? 'CONFIRMED' : booking.status,
      },
    });

    if (booking.invoices && booking.invoices.length > 0) {
      const invoice = booking.invoices[0];
      const newDue = Math.max(0, invoice.amountDue - Number(data.amount));
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: { increment: Number(data.amount) },
          amountDue: newDue,
          status: newDue === 0 ? 'SUCCESS' : 'PROCESSING',
        },
      });
    }

    const providerLabel =
      paymentMethod === 'CASH'
        ? 'Cash on Delivery / Pickup'
        : paymentMethod === 'BANK_TRANSFER'
        ? 'Direct Bank Transfer'
        : 'Credit/Debit Card';

    await this.notificationsService.createNotification({
      userId: booking.customerId,
      title: 'Payment Confirmed',
      message: `Payment of PKR ${data.amount} for reservation ${booking.bookingReference} received via ${providerLabel}.`,
      type: 'PAYMENT_SUCCESS',
      linkUrl: `/customer/bookings/${booking.id}`,
    });

    await this.auditService.log({
      userId,
      action: 'PAYMENT_PROCESSED',
      entity: 'Payment',
      entityId: payment.id,
      details: `Processed PKR ${data.amount} via ${providerLabel} for booking ${booking.bookingReference}`,
    });

    return payment;
  }

  async processBankTransfer(
    userId: string,
    data: { bookingId: string; amount: number; transactionId?: string; bankName?: string; senderAccount?: string },
    file?: Express.Multer.File,
  ) {
    let slipPath: string | undefined = undefined;
    if (file) {
      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `slip_${data.bookingId}_${Date.now()}${ext}`;
      const uploadResult = await this.storageService.uploadFile('receipts', filename, file.buffer, file.mimetype);
      slipPath = uploadResult.path;
    }

    const parts = [];
    if (data.transactionId) parts.push(`TXN: ${data.transactionId}`);
    if (slipPath) parts.push(`Slip: ${slipPath}`);
    if (data.bankName) parts.push(`Bank: ${data.bankName}`);
    if (data.senderAccount) parts.push(`Sender: ${data.senderAccount}`);

    const txnIdentifier = parts.length > 0 ? parts.join(' | ') : `BANK-TRANSFER-${Date.now()}`;

    return this.processPayment(userId, {
      bookingId: data.bookingId,
      amount: Number(data.amount),
      provider: 'BANK_TRANSFER',
      transactionId: txnIdentifier,
    });
  }

  async getBookingPayments(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
