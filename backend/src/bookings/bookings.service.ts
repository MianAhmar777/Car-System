import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export interface CreateBookingDto {
  carId: string;
  pickupLocationId: string;
  returnLocationId: string;
  pickupDateTime: string;
  returnDateTime: string;
  serviceIds?: string[];
  discountCode?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  private generateBookingReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BK-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const pickupDate = new Date(dto.pickupDateTime);
    const returnDate = new Date(dto.returnDateTime);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime()) || pickupDate >= returnDate) {
      throw new BadRequestException('Pickup date must be strictly before return date.');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (pickupDate < todayStart) {
      throw new BadRequestException('Pickup date cannot be in the past. Please select today or a future date.');
    }

    // Availability Engine with Transaction & Locking
    return await this.prisma.$transaction(async (tx) => {
      // 1. Check vehicle status
      const car = await tx.car.findUnique({
        where: { id: dto.carId },
      });

      if (!car || car.deletedAt || car.status === 'INACTIVE' || car.status === 'MAINTENANCE') {
        throw new BadRequestException('The selected vehicle is currently inactive or under maintenance.');
      }

      // 2. Check overlap in database (strict interval intersection)
      const overlapping = await tx.booking.findFirst({
        where: {
          carId: dto.carId,
          status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP', 'ACTIVE'] },
          pickupDateTime: { lt: returnDate },
          returnDateTime: { gt: pickupDate },
        },
      });

      if (overlapping) {
        throw new BadRequestException('Vehicle is not available for the selected dates. Another booking overlaps this timeframe.');
      }

      // 3. Price calculation snapshot
      const priceCalc = await this.pricingService.calculatePrice({
        carId: dto.carId,
        pickupDateTime: pickupDate,
        returnDateTime: returnDate,
        serviceIds: dto.serviceIds,
        discountCode: dto.discountCode,
      });

      const bookingReference = this.generateBookingReference();

      const booking = await tx.booking.create({
        data: {
          bookingReference,
          customerId,
          carId: dto.carId,
          pickupLocationId: dto.pickupLocationId,
          returnLocationId: dto.returnLocationId,
          pickupDateTime: pickupDate,
          returnDateTime: returnDate,
          rentalDays: priceCalc.rentalDays,
          basePrice: priceCalc.basePrice,
          servicesFee: priceCalc.servicesFee,
          discountAmount: priceCalc.discountAmount,
          taxAmount: priceCalc.taxAmount,
          securityDeposit: priceCalc.securityDeposit,
          totalAmount: priceCalc.totalAmount,
          discountId: priceCalc.discountId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          services: dto.serviceIds
            ? {
                create: priceCalc.serviceBreakdown.map((s) => ({
                  serviceId: s.serviceId,
                  price: s.price,
                })),
              }
            : undefined,
        },
        include: {
          car: true,
          customer: { select: { fullName: true, email: true } },
          services: { include: { service: true } },
        },
      });

      // Update discount usage if applied
      if (priceCalc.discountId) {
        await tx.discount.update({
          where: { id: priceCalc.discountId },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // Create initial Invoice record
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      await tx.invoice.create({
        data: {
          invoiceNumber,
          bookingId: booking.id,
          baseAmount: priceCalc.basePrice,
          servicesFee: priceCalc.servicesFee,
          discount: priceCalc.discountAmount,
          tax: priceCalc.taxAmount,
          depositAmount: priceCalc.securityDeposit,
          totalAmount: priceCalc.totalAmount,
          amountDue: priceCalc.totalAmount + priceCalc.securityDeposit,
          status: 'PENDING',
        },
      });

      await this.notificationsService.createNotification({
        userId: customerId,
        title: 'Booking Created',
        message: `Your reservation request #${bookingReference} for ${car.make} ${car.model} has been created.`,
        type: 'BOOKING_CREATED',
        linkUrl: `/customer/bookings/${booking.id}`,
      });

      await this.auditService.log({
        userId: customerId,
        action: 'BOOKING_CREATED',
        entity: 'Booking',
        entityId: booking.id,
        details: `Created reservation ${bookingReference} for total \$${priceCalc.totalAmount}`,
      });

      return booking;
    });
  }

  async findCustomerBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: {
        car: { include: { images: true } },
        pickupLocation: true,
        returnLocation: true,
        services: { include: { service: true } },
        payments: true,
        invoices: true,
        rentalContracts: true,
        releaseAuthorization: { include: { checklist: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllBookings(status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true, cnicPassport: true, licenseNumber: true } },
        car: { select: { id: true, make: true, model: true, year: true, registrationNumber: true, dailyRate: true } },
        pickupLocation: true,
        returnLocation: true,
        payments: true,
        invoices: true,
        rentalContracts: { include: { versions: true, signatures: true } },
        releaseAuthorization: { include: { checklist: true } },
        inspections: true,
        services: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; roleName: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true, cnicPassport: true, licenseNumber: true } },
        car: { include: { images: true, category: true } },
        pickupLocation: true,
        returnLocation: true,
        services: { include: { service: true } },
        payments: true,
        invoices: true,
        rentalContracts: { include: { versions: true, signatures: true } },
        releaseAuthorization: { include: { checklist: true } },
        inspections: true,
        review: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    if (user.roleName === 'CUSTOMER' && booking.customerId !== user.id) {
      throw new ForbiddenException('You are not authorized to view this booking.');
    }

    return booking;
  }

  async updateBookingStatus(id: string, newStatus: BookingStatus, user: { id: string; roleName: string }, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');

    // State machine check: prevent invalid transitions e.g. CANCELLED -> PICKED_UP
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cancelled bookings cannot be modified.');
    }
    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Completed bookings cannot be modified.');
    }

    if (newStatus === 'CANCELLED') {
      if (booking.status === 'PICKED_UP' || booking.status === 'ACTIVE') {
        throw new BadRequestException('Cannot cancel an active rental.');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: newStatus,
        cancellationReason: newStatus === 'CANCELLED' ? reason : booking.cancellationReason,
      },
    });

    await this.notificationsService.createNotification({
      userId: booking.customerId,
      title: `Booking Status: ${newStatus}`,
      message: `Your booking #${booking.bookingReference} status changed to ${newStatus}.`,
      type: `BOOKING_${newStatus}`,
      linkUrl: `/customer/bookings/${booking.id}`,
    });

    await this.auditService.log({
      userId: user.id,
      action: `BOOKING_STATUS_${newStatus}`,
      entity: 'Booking',
      entityId: booking.id,
      details: `Changed status from ${booking.status} to ${newStatus}`,
    });

    return updated;
  }
}
