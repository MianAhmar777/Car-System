import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.maintenance.findMany({
      include: { car: { select: { make: true, model: true, registrationNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { carId: string; title: string; description?: string; cost?: number; startDate: string; endDate?: string }) {
    const maintenance = await this.prisma.maintenance.create({
      data: {
        carId: data.carId,
        title: data.title,
        description: data.description,
        cost: data.cost ? Number(data.cost) : 0,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCompleted: false,
      },
    });

    // Lock car in MAINTENANCE state
    await this.prisma.car.update({
      where: { id: data.carId },
      data: { status: 'MAINTENANCE' },
    });

    return maintenance;
  }

  async completeMaintenance(id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({ where: { id } });
    if (!maintenance) throw new NotFoundException('Maintenance record not found.');

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: { isCompleted: true, endDate: new Date() },
    });

    // Return car to AVAILABLE state
    await this.prisma.car.update({
      where: { id: maintenance.carId },
      data: { status: 'AVAILABLE' },
    });

    return updated;
  }
}
