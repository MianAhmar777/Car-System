import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ServicePricingType } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.additionalService.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.additionalService.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(data: { name: string; description?: string; price: number; pricingType?: ServicePricingType }) {
    return this.prisma.additionalService.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.additionalService.update({ where: { id }, data });
  }
}
