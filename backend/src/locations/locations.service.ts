import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async create(data: { name: string; address: string; city: string; contactPhone?: string; openingHours?: string }) {
    return this.prisma.location.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; address: string; city: string; contactPhone: string; openingHours: string; isActive: boolean }>) {
    return this.prisma.location.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.location.update({ where: { id }, data: { isActive: false } });
  }
}
