import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(roleName?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: roleName ? { name: roleName.toUpperCase() } : undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        cnicPassport: true,
        licenseNumber: true,
        isVerified: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        customerDocuments: true,
        bookings: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found.');
    }
    const { password, refreshTokenHash, otpCode, ...result } = user;
    return result;
  }

  async updateProfile(id: string, data: { fullName?: string; phone?: string; cnicPassport?: string; licenseNumber?: string; address?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        cnicPassport: data.cnicPassport,
        licenseNumber: data.licenseNumber,
        address: data.address,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        cnicPassport: true,
        licenseNumber: true,
        address: true,
      },
    });
  }

  async updateUserRole(userId: string, roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new BadRequestException('Invalid role ID.');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });
  }
}
