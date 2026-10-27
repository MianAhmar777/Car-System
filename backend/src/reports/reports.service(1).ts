import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboardStats() {
    const [
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      rentedVehicles,
      maintenanceVehicles,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      totalCustomers,
      totalRevenueResult,
      pendingContracts,
      signedContracts,
      releaseBlocks,
    ] = await Promise.all([
      this.prisma.car.count({ where: { deletedAt: null } }),
      this.prisma.car.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      this.prisma.car.count({ where: { deletedAt: null, status: 'RESERVED' } }),
      this.prisma.car.count({ where: { deletedAt: null, status: 'RENTED' } }),
      this.prisma.car.count({ where: { deletedAt: null, status: 'MAINTENANCE' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: { in: ['PICKED_UP', 'ACTIVE'] } } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.user.count({ where: { deletedAt: null, role: { name: 'CUSTOMER' } } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.rentalContract.count({ where: { status: 'PENDING_SIGNATURE' } }),
      this.prisma.rentalContract.count({ where: { status: { in: ['SIGNED_BY_CUSTOMER', 'VERIFIED'] } } }),
      this.prisma.vehicleReleaseAuthorization.count({ where: { isAuthorized: false } }),
    ]);

    const totalRevenue = totalRevenueResult._sum.amount || 0;
    const utilizationRate = totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0;

    return {
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        reserved: reservedVehicles,
        rented: rentedVehicles,
        maintenance: maintenanceVehicles,
        utilizationRate: `${utilizationRate}%`,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        active: activeBookings,
        completed: completedBookings,
      },
      customers: totalCustomers,
      financials: {
        totalRevenue,
      },
      contracts: {
        pending: pendingContracts,
        signed: signedContracts,
      },
      releaseBlocks,
    };
  }

  async getRecentActivity() {
    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        car: { select: { make: true, model: true } },
      },
    });

    const recentContracts = await this.prisma.rentalContract.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
      },
    });

    return { recentBookings, recentContracts };
  }
}
