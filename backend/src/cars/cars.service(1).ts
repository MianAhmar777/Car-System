import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CarStatus, TransmissionType, FuelType } from '@prisma/client';

export interface CarFilterQuery {
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  seatingCapacity?: number;
  status?: CarStatus;
  pickupDate?: string;
  returnDate?: string;
  search?: string;
}

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CarFilterQuery) {
    const {
      categoryId,
      locationId,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      seatingCapacity,
      status,
      pickupDate,
      returnDate,
      search,
    } = query;

    let unavailableCarIds: string[] = [];

    // Date availability filtering
    if (pickupDate && returnDate) {
      const pDate = new Date(pickupDate);
      const rDate = new Date(returnDate);

      if (isNaN(pDate.getTime()) || isNaN(rDate.getTime()) || pDate >= rDate) {
        throw new BadRequestException('Invalid pickup or return date range.');
      }

      // Find cars with overlapping active bookings or maintenance
      const overlappingBookings = await this.prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP', 'ACTIVE'] },
          pickupDateTime: { lt: rDate },
          returnDateTime: { gt: pDate },
        },
        select: { carId: true },
      });

      const maintenanceCars = await this.prisma.maintenance.findMany({
        where: {
          isCompleted: false,
          startDate: { lte: rDate },
          OR: [{ endDate: null }, { endDate: { gte: pDate } }],
        },
        select: { carId: true },
      });

      unavailableCarIds = [
        ...overlappingBookings.map((b) => b.carId),
        ...maintenanceCars.map((m) => m.carId),
      ];
    }

    const whereCondition: any = {
      deletedAt: null,
      status: status || 'AVAILABLE',
      id: unavailableCarIds.length > 0 ? { notIn: unavailableCarIds } : undefined,
    };

    if (categoryId) whereCondition.categoryId = categoryId;
    if (transmission) whereCondition.transmission = transmission;
    if (fuelType) whereCondition.fuelType = fuelType;
    if (seatingCapacity) whereCondition.seatingCapacity = { gte: Number(seatingCapacity) };

    if (minPrice || maxPrice) {
      whereCondition.dailyRate = {};
      if (minPrice) whereCondition.dailyRate.gte = Number(minPrice);
      if (maxPrice) whereCondition.dailyRate.lte = Number(maxPrice);
    }

    if (locationId) {
      whereCondition.locations = {
        some: { locationId },
      };
    }

    if (search) {
      whereCondition.OR = [
        { make: { contains: search } },
        { model: { contains: search } },
        { registrationNumber: { contains: search } },
      ];
    }

    return this.prisma.car.findMany({
      where: whereCondition,
      include: {
        category: true,
        images: true,
        features: true,
        locations: { include: { location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        features: true,
        locations: { include: { location: true } },
        reviews: { include: { user: { select: { fullName: true } } } },
      },
    });

    if (!car || car.deletedAt) {
      throw new NotFoundException('Vehicle not found.');
    }
    return car;
  }

  async create(data: {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    color: string;
    categoryId: string;
    transmission?: TransmissionType;
    fuelType?: FuelType;
    seatingCapacity?: number;
    doors?: number;
    mileage?: number;
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    securityDeposit?: number;
    description?: string;
    features?: string[];
    images?: string[];
    locationIds?: string[];
  }) {
    const existing = await this.prisma.car.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });
    if (existing) {
      throw new BadRequestException('Car with this registration number already exists.');
    }

    const { features, images, locationIds, ...carData } = data;

    const car = await this.prisma.car.create({
      data: {
        ...carData,
        features: features
          ? { create: features.map((f) => ({ name: f })) }
          : undefined,
        images: images
          ? { create: images.map((url, idx) => ({ url, isPrimary: idx === 0 })) }
          : undefined,
        locations: locationIds
          ? { create: locationIds.map((lId) => ({ locationId: lId })) }
          : undefined,
      },
      include: { category: true, images: true, features: true, locations: true },
    });

    return car;
  }

  async update(id: string, data: any) {
    const { features, images, locationIds, ...carData } = data;

    if (locationIds) {
      await this.prisma.locationCar.deleteMany({ where: { carId: id } });
      await this.prisma.locationCar.createMany({
        data: locationIds.map((lId: string) => ({ carId: id, locationId: lId })),
      });
    }

    return this.prisma.car.update({
      where: { id },
      data: carData,
      include: { category: true, images: true, features: true, locations: true },
    });
  }

  async updateStatus(id: string, status: CarStatus) {
    return this.prisma.car.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string) {
    return this.prisma.car.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }
}
