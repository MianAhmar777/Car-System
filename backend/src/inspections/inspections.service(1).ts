import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { InspectionType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InspectionsService {
  private readonly BUCKET_NAME = 'inspection-images';

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private auditService: AuditService,
  ) {}

  async createInspection(
    inspectorId: string,
    data: {
      bookingId: string;
      carId?: string;
      type: InspectionType;
      mileage: number;
      fuelLevel: number;
      existingDamage?: string;
      newDamage?: string;
      notes?: string;
      additionalFee?: number;
      photoFiles?: { originalname: string; buffer: Buffer; mimetype: string }[];
    },
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id: data.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found.');

    const carId = data.carId || booking.carId;

    const photoPaths: string[] = [];

    if (data.photoFiles && data.photoFiles.length > 0) {
      for (let i = 0; i < data.photoFiles.length; i++) {
        const file = data.photoFiles[i];
        const ext = file.originalname.split('.').pop();
        const path = `${data.bookingId}/${data.type.toLowerCase()}_${Date.now()}_${i}.${ext}`;
        await this.storageService.uploadFile(this.BUCKET_NAME, path, file.buffer, file.mimetype);
        photoPaths.push(path);
      }
    }

    const inspection = await this.prisma.vehicleInspection.create({
      data: {
        bookingId: data.bookingId,
        carId,
        inspectorId,
        type: data.type,
        mileage: Number(data.mileage),
        fuelLevel: Number(data.fuelLevel),
        existingDamage: data.existingDamage,
        newDamage: data.newDamage,
        notes: data.notes,
        additionalFee: data.additionalFee ? Number(data.additionalFee) : 0,
        photos: JSON.stringify(photoPaths),
      },
    });

    // Update vehicle mileage
    await this.prisma.car.update({
      where: { id: carId },
      data: { mileage: Number(data.mileage) },
    });

    if (data.type === 'RETURN') {
      // If returned, update vehicle status to AVAILABLE and booking to RETURNED / COMPLETED
      await this.prisma.car.update({
        where: { id: carId },
        data: { status: 'AVAILABLE' },
      });

      await this.prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'RETURNED' },
      });

      if (data.additionalFee && data.additionalFee > 0) {
        // Adjust invoice amount due for damage/fuel fees
        await this.prisma.invoice.updateMany({
          where: { bookingId: data.bookingId },
          data: {
            totalAmount: { increment: data.additionalFee },
            amountDue: { increment: data.additionalFee },
          },
        });
      }
    }

    await this.auditService.log({
      userId: inspectorId,
      action: `VEHICLE_INSPECTION_${data.type}`,
      entity: 'VehicleInspection',
      entityId: inspection.id,
      details: `Recorded ${data.type} inspection for car mileage ${data.mileage} and fuel ${data.fuelLevel}%`,
    });

    return inspection;
  }

  async getInspectionsForBooking(bookingId: string) {
    const inspections = await this.prisma.vehicleInspection.findMany({
      where: { bookingId },
      include: { inspector: { select: { fullName: true } } },
      orderBy: { inspectedAt: 'asc' },
    });

    return Promise.all(
      inspections.map(async (ins) => {
        let signedPhotoUrls: string[] = [];
        if (ins.photos) {
          const paths: string[] = JSON.parse(ins.photos);
          signedPhotoUrls = await Promise.all(
            paths.map((p) => this.storageService.getSignedUrl(this.BUCKET_NAME, p, 3600)),
          );
        }
        return { ...ins, signedPhotoUrls };
      }),
    );
  }
}
