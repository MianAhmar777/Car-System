import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.carCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.carCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string; description?: string; iconUrl?: string; sortOrder?: number }) {
    return this.prisma.carCategory.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; description: string; iconUrl: string; sortOrder: number; isActive: boolean }>) {
    return this.prisma.carCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.carCategory.update({ where: { id }, data: { isActive: false } });
  }
}
