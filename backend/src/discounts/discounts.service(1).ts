import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async validateDiscountCode(code: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      throw new BadRequestException('Invalid or inactive discount code.');
    }

    const now = new Date();
    if (discount.validFrom > now || discount.validUntil < now) {
      throw new BadRequestException('Discount code has expired or is not yet active.');
    }

    if (discount.usageLimit !== null && discount.timesUsed >= discount.usageLimit) {
      throw new BadRequestException('Discount code usage limit exceeded.');
    }

    return discount;
  }

  async create(data: {
    code: string;
    description?: string;
    percentage?: number;
    fixedAmount?: number;
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
  }) {
    const existing = await this.prisma.discount.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('Discount code already exists.');
    }

    return this.prisma.discount.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        percentage: data.percentage,
        fixedAmount: data.fixedAmount,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        usageLimit: data.usageLimit,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.discount.update({ where: { id }, data });
  }
}
