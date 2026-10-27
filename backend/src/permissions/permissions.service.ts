import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({ orderBy: { action: 'asc' } });
  }

  async create(data: { action: string; description?: string }) {
    return this.prisma.permission.create({
      data: {
        action: data.action,
        description: data.description,
      },
    });
  }
}
