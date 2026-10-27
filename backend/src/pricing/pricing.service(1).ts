import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface PriceCalculationParams {
  carId: string;
  pickupDateTime: Date;
  returnDateTime: Date;
  serviceIds?: string[];
  discountCode?: string;
}

export interface PriceCalculationResult {
  rentalDays: number;
  dailyRate: number;
  basePrice: number;
  servicesFee: number;
  discountAmount: number;
  taxAmount: number;
  securityDeposit: number;
  totalAmount: number;
  discountId?: string;
  serviceBreakdown: { serviceId: string; name: string; price: number }[];
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  calculateDays(pickup: Date, returnDate: Date): number {
    const diffMs = returnDate.getTime() - pickup.getTime();
    if (diffMs <= 0) {
      throw new BadRequestException('Return date/time must be strictly after pickup date/time.');
    }
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days < 1 ? 1 : days;
  }

  async calculatePrice(params: PriceCalculationParams): Promise<PriceCalculationResult> {
    const car = await this.prisma.car.findUnique({
      where: { id: params.carId },
    });

    if (!car || car.deletedAt || car.status === 'INACTIVE') {
      throw new BadRequestException('Selected vehicle is invalid or unavailable.');
    }

    const rentalDays = this.calculateDays(params.pickupDateTime, params.returnDateTime);

    // Apply rate logic (Monthly rate > Weekly rate > Daily rate)
    let dailyRate = car.dailyRate;
    let basePrice = 0;

    if (rentalDays >= 30 && car.monthlyRate) {
      const months = Math.floor(rentalDays / 30);
      const remainingDays = rentalDays % 30;
      basePrice = months * car.monthlyRate + remainingDays * car.dailyRate;
    } else if (rentalDays >= 7 && car.weeklyRate) {
      const weeks = Math.floor(rentalDays / 7);
      const remainingDays = rentalDays % 7;
      basePrice = weeks * car.weeklyRate + remainingDays * car.dailyRate;
    } else {
      basePrice = rentalDays * dailyRate;
    }

    // Additional services calculation
    let servicesFee = 0;
    const serviceBreakdown: { serviceId: string; name: string; price: number }[] = [];

    if (params.serviceIds && params.serviceIds.length > 0) {
      const services = await this.prisma.additionalService.findMany({
        where: { id: { in: params.serviceIds }, isActive: true },
      });

      for (const svc of services) {
        let cost = 0;
        if (svc.pricingType === 'PER_DAY') {
          cost = svc.price * rentalDays;
        } else {
          cost = svc.price; // PER_BOOKING or FIXED
        }
        servicesFee += cost;
        serviceBreakdown.push({ serviceId: svc.id, name: svc.name, price: cost });
      }
    }

    // Discount code calculation
    let discountAmount = 0;
    let discountId: string | undefined = undefined;

    if (params.discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { code: params.discountCode.toUpperCase() },
      });

      const now = new Date();
      if (
        discount &&
        discount.isActive &&
        discount.validFrom <= now &&
        discount.validUntil >= now &&
        (discount.usageLimit === null || discount.timesUsed < discount.usageLimit)
      ) {
        discountId = discount.id;
        if (discount.percentage) {
          discountAmount = (basePrice * discount.percentage) / 100;
        } else if (discount.fixedAmount) {
          discountAmount = discount.fixedAmount;
        }
      }
    }

    const subtotal = Math.max(0, basePrice + servicesFee - discountAmount);
    const taxRate = 0.10; // 10% standard tax
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const securityDeposit = car.securityDeposit || 0;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    return {
      rentalDays,
      dailyRate,
      basePrice,
      servicesFee,
      discountAmount,
      taxAmount,
      securityDeposit,
      totalAmount,
      discountId,
      serviceBreakdown,
    };
  }
}
