import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async createRole(data: { name: string; description?: string }) {
    const existing = await this.prisma.role.findUnique({ where: { name: data.name.toUpperCase() } });
    if (existing) {
      throw new BadRequestException('Role already exists.');
    }
    return this.prisma.role.create({
      data: {
        name: data.name.toUpperCase(),
        description: data.description,
      },
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    const data = permissionIds.map((pId) => ({ roleId, permissionId: pId }));
    await this.prisma.rolePermission.createMany({ data });
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
  }
}
