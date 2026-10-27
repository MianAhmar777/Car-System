import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VehicleReleaseService {
  private readonly logger = new Logger(VehicleReleaseService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async checkReleaseChecklist(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: { customerDocuments: true },
        },
        car: true,
        payments: true,
        rentalContracts: {
          include: { signatures: true, reviews: true },
          orderBy: { createdAt: 'desc' },
        },
        inspections: { where: { type: 'PICKUP' } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    const bookingConfirmed = ['CONFIRMED', 'PENDING'].includes(booking.status);
    const customerIdentified = Boolean(booking.customer.fullName && booking.customer.email);

    // Document checks (verified CNIC/Passport & Driving License)
    const verifiedDocs = booking.customer.customerDocuments.filter(
      (d) => d.verificationStatus === 'VERIFIED',
    );
    const hasLicense = verifiedDocs.some((d) => d.documentType === 'DRIVING_LICENSE') || Boolean(booking.customer.licenseNumber);
    const documentsVerified = verifiedDocs.length > 0 && hasLicense;
    const drivingLicenseVerified = hasLicense;

    // Payment & Deposit checks
    const totalPaid = booking.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);
    const paymentVerified = booking.paymentStatus === 'SUCCESS' || totalPaid >= booking.totalAmount;
    const securityDepositPaid = totalPaid >= booking.totalAmount + booking.securityDeposit || booking.paymentStatus === 'SUCCESS';

    // Contract checks
    const contract = booking.rentalContracts[0];
    const contractSigned = contract
      ? ['SIGNED_BY_CUSTOMER', 'UPLOADED_BY_CUSTOMER', 'VERIFIED'].includes(contract.status)
      : false;
    const contractApproved = contract ? contract.status === 'VERIFIED' : false;

    // Car & Inspection checks
    const vehicleAvailable = booking.car.status === 'AVAILABLE' || booking.car.status === 'RESERVED';
    const inspectionCompleted = booking.inspections.length > 0;

    const passedAll =
      bookingConfirmed &&
      customerIdentified &&
      drivingLicenseVerified &&
      documentsVerified &&
      paymentVerified &&
      securityDepositPaid &&
      contractSigned &&
      contractApproved &&
      vehicleAvailable &&
      inspectionCompleted;

    const blockedReasons: string[] = [];
    if (!bookingConfirmed) blockedReasons.push('Booking status is invalid or cancelled.');
    if (!customerIdentified) blockedReasons.push('Customer identity not confirmed.');
    if (!drivingLicenseVerified) blockedReasons.push('Driving license not verified.');
    if (!documentsVerified) blockedReasons.push('Required customer identity documents not verified.');
    if (!paymentVerified) blockedReasons.push('Rental payment has not been received or confirmed.');
    if (!securityDepositPaid) blockedReasons.push('Security deposit not fully satisfied.');
    if (!contractSigned) blockedReasons.push('Rental contract has not been signed by customer.');
    if (!contractApproved) blockedReasons.push('Signed contract has not been verified/approved by admin/staff.');
    if (!vehicleAvailable) blockedReasons.push('Vehicle is not in AVAILABLE status.');
    if (!inspectionCompleted) blockedReasons.push('Pre-pickup vehicle inspection photo/mileage check not completed.');

    return {
      bookingId,
      carId: booking.carId,
      carRegistration: booking.car.registrationNumber,
      checklist: {
        bookingConfirmed,
        customerIdentified,
        drivingLicenseVerified,
        documentsVerified,
        paymentVerified,
        securityDepositPaid,
        contractSigned,
        contractApproved,
        vehicleAvailable,
        inspectionCompleted,
        passedAll,
      },
      blockedReasons,
      isAuthorizedToRelease: passedAll,
    };
  }

  async authorizeVehicleRelease(bookingId: string, authorizedById: string, overrideReason?: string) {
    const check = await this.checkReleaseChecklist(bookingId);

    if (!check.isAuthorizedToRelease && !overrideReason) {
      throw new BadRequestException({
        message: 'Vehicle release blocked due to incomplete requirements.',
        blockedReasons: check.blockedReasons,
      });
    }

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const authRecord = await this.prisma.vehicleReleaseAuthorization.upsert({
      where: { bookingId },
      update: {
        authorizedById,
        isAuthorized: true,
        blockedReason: check.isAuthorizedToRelease ? null : `Authorized via staff override: ${overrideReason}`,
        authorizedAt: new Date(),
        checklist: {
          upsert: {
            create: { ...check.checklist },
            update: { ...check.checklist },
          },
        },
      },
      create: {
        bookingId,
        carId: booking.carId,
        authorizedById,
        isAuthorized: true,
        blockedReason: check.isAuthorizedToRelease ? null : `Authorized via staff override: ${overrideReason}`,
        authorizedAt: new Date(),
        checklist: {
          create: { ...check.checklist },
        },
      },
      include: { checklist: true },
    });

    // Update car status to RENTED and booking to ACTIVE/PICKED_UP
    await this.prisma.car.update({
      where: { id: booking.carId },
      data: { status: 'RENTED' },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PICKED_UP' },
    });

    await this.notificationsService.createNotification({
      userId: booking.customerId,
      title: 'Vehicle Release Authorized',
      message: `Your vehicle handover is authorized! You may pick up your reserved vehicle.`,
      type: 'VEHICLE_RELEASE_AUTHORIZED',
      linkUrl: `/customer/bookings/${bookingId}`,
    });

    await this.auditService.log({
      userId: authorizedById,
      action: 'VEHICLE_RELEASE_AUTHORIZED',
      entity: 'Booking',
      entityId: bookingId,
      details: check.isAuthorizedToRelease
        ? 'Authorized vehicle release - All checklist requirements met'
        : `Authorized vehicle release via override: ${overrideReason}`,
    });

    return authRecord;
  }

  async findReleaseAuthorization(bookingId: string) {
    return this.prisma.vehicleReleaseAuthorization.findUnique({
      where: { bookingId },
      include: { checklist: true, authorizedBy: { select: { fullName: true } } },
    });
  }
}
