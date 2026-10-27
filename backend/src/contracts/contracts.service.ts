import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ContractStatus, SignatureMethod } from '@prisma/client';

@Injectable()
export class ContractsService {
  private readonly BUCKET_NAME = 'contracts';
  private readonly SIGNED_BUCKET_NAME = 'signed-contracts';
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private pdfGenerator: PdfGeneratorService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  private generateContractNumber(): string {
    return `RC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  async generateContractForBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        car: true,
        pickupLocation: true,
        returnLocation: true,
        rentalContracts: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    // Check if dynamic template exists
    let template = await this.prisma.contractTemplate.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!template) {
      template = await this.prisma.contractTemplate.create({
        data: {
          title: 'Standard Vehicle Rental Terms & Policy',
          bodyText: `This Vehicle Rental Agreement is made between the Rental Company ("Lessor") and the Renter ("Lessee"). By signing this agreement, Lessee agrees to take full responsibility for the vehicle, adhere to speed limits, return vehicle on time with equal fuel, and maintain security deposit until vehicle release inspection is completed.`,
          version: 1,
        },
      });
    }

    const existingContract = booking.rentalContracts[0];
    const contractNumber = existingContract ? existingContract.contractNumber : this.generateContractNumber();

    const { pdfBuffer, checksum } = await this.pdfGenerator.generateContractPdf({
      contractNumber,
      versionNumber: existingContract ? existingContract.currentVersion + 1 : 1,
      customerName: booking.customer.fullName,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone || 'N/A',
      carDetails: `${booking.car.make} ${booking.car.model} (${booking.car.year})`,
      registrationNumber: booking.car.registrationNumber,
      pickupLocation: booking.pickupLocation.name,
      returnLocation: booking.returnLocation.name,
      pickupDate: booking.pickupDateTime.toISOString().split('T')[0],
      returnDate: booking.returnDateTime.toISOString().split('T')[0],
      rentalDays: booking.rentalDays,
      totalAmount: booking.totalAmount,
      securityDeposit: booking.securityDeposit,
      termsText: template.bodyText,
    });

    const storagePath = `${booking.customerId}/${contractNumber}_v${existingContract ? existingContract.currentVersion + 1 : 1}.pdf`;
    await this.storageService.uploadFile(this.BUCKET_NAME, storagePath, pdfBuffer, 'application/pdf');

    let contract;
    if (existingContract) {
      const nextVersion = existingContract.currentVersion + 1;
      contract = await this.prisma.rentalContract.update({
        where: { id: existingContract.id },
        data: {
          currentVersion: nextVersion,
          status: 'PENDING_SIGNATURE',
          versions: {
            create: {
              versionNumber: nextVersion,
              contentSnapshot: template.bodyText,
              pdfFilePath: storagePath,
              checksum,
            },
          },
        },
        include: { versions: true },
      });
    } else {
      contract = await this.prisma.rentalContract.create({
        data: {
          contractNumber,
          bookingId: booking.id,
          customerId: booking.customerId,
          templateId: template.id,
          currentVersion: 1,
          status: 'PENDING_SIGNATURE',
          versions: {
            create: {
              versionNumber: 1,
              contentSnapshot: template.bodyText,
              pdfFilePath: storagePath,
              checksum,
            },
          },
        },
        include: { versions: true },
      });
    }

    await this.prisma.contractAuditEvent.create({
      data: {
        contractId: contract.id,
        userId: booking.customerId,
        action: 'CONTRACT_GENERATED',
        details: `Generated contract version v${contract.currentVersion} with checksum ${checksum}`,
      },
    });

    await this.notificationsService.createNotification({
      userId: booking.customerId,
      title: 'Rental Contract Ready for Signature',
      message: `Your rental contract ${contractNumber} is generated and ready for your review and signature.`,
      type: 'CONTRACT_READY_FOR_SIGNATURE',
      linkUrl: `/customer/contracts/${contract.id}`,
    });

    return contract;
  }

  async findContractById(id: string, user: { id: string; roleName: string }) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: true,
            car: true,
            pickupLocation: true,
            returnLocation: true,
          },
        },
        versions: { orderBy: { versionNumber: 'desc' } },
        signatures: { include: { user: { select: { fullName: true } } } },
        documents: true,
        reviews: { include: { reviewer: { select: { fullName: true } } } },
        auditEvents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');

    if (user.roleName === 'CUSTOMER' && contract.customerId !== user.id) {
      throw new ForbiddenException('Access denied to this rental contract.');
    }

    // Attach signed URL for latest version PDF
    const latestVersion = contract.versions[0];
    let pdfUrl = null;
    if (latestVersion && latestVersion.pdfFilePath) {
      const bucket = contract.status === 'SIGNED_BY_CUSTOMER' || contract.status === 'VERIFIED' ? this.SIGNED_BUCKET_NAME : this.BUCKET_NAME;
      pdfUrl = await this.storageService.getSignedUrl(bucket, latestVersion.pdfFilePath, 3600);
    }

    return { ...contract, pdfUrl };
  }

  async signContractOnline(
    contractId: string,
    userId: string,
    signatureDataUrl: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
      include: {
        booking: { include: { customer: true, car: true, pickupLocation: true, returnLocation: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');
    if (contract.customerId !== userId) throw new ForbiddenException('Only the booking customer can sign this contract.');
    if (contract.status === 'VERIFIED') throw new BadRequestException('This contract has already been approved and signed.');

    const latestVersion = contract.versions[0];

    // Regenerate final signed PDF with embedded signature image
    const { pdfBuffer, checksum } = await this.pdfGenerator.generateContractPdf({
      contractNumber: contract.contractNumber,
      versionNumber: latestVersion.versionNumber,
      customerName: contract.booking.customer.fullName,
      customerEmail: contract.booking.customer.email,
      customerPhone: contract.booking.customer.phone || 'N/A',
      carDetails: `${contract.booking.car.make} ${contract.booking.car.model}`,
      registrationNumber: contract.booking.car.registrationNumber,
      pickupLocation: contract.booking.pickupLocation.name,
      returnLocation: contract.booking.returnLocation.name,
      pickupDate: contract.booking.pickupDateTime.toISOString().split('T')[0],
      returnDate: contract.booking.returnDateTime.toISOString().split('T')[0],
      rentalDays: contract.booking.rentalDays,
      totalAmount: contract.booking.totalAmount,
      securityDeposit: contract.booking.securityDeposit,
      termsText: latestVersion.contentSnapshot,
      signatureDataUrl,
      signedAt: new Date().toISOString(),
    });

    const signedStoragePath = `${userId}/${contract.contractNumber}_v${latestVersion.versionNumber}_signed.pdf`;
    await this.storageService.uploadFile(this.SIGNED_BUCKET_NAME, signedStoragePath, pdfBuffer, 'application/pdf');

    // Record digital signature evidence & update status
    await this.prisma.$transaction([
      this.prisma.contractSignature.create({
        data: {
          contractId: contract.id,
          versionId: latestVersion.id,
          userId,
          signatureMethod: 'E_SIGNATURE',
          signatureData: signatureDataUrl,
          ipAddress,
          userAgent,
          documentHash: checksum,
        },
      }),
      this.prisma.rentalContractVersion.update({
        where: { id: latestVersion.id },
        data: { pdfFilePath: signedStoragePath, checksum },
      }),
      this.prisma.rentalContract.update({
        where: { id: contract.id },
        data: { status: 'SIGNED_BY_CUSTOMER' },
      }),
      this.prisma.contractAuditEvent.create({
        data: {
          contractId: contract.id,
          userId,
          action: 'CONTRACT_SIGNED',
          details: `Signed online via E-Signature. IP: ${ipAddress}. Checksum: ${checksum}`,
          ipAddress,
        },
      }),
    ]);

    await this.notificationsService.createNotificationForRole('STAFF', {
      title: 'Customer Signed Contract',
      message: `Customer ${contract.booking.customer.fullName} has signed contract ${contract.contractNumber}. Ready for review.`,
      type: 'CONTRACT_SIGNED',
      linkUrl: `/staff/contracts/${contract.id}`,
    });

    await this.auditService.log({
      userId,
      action: 'CONTRACT_SIGNED_ONLINE',
      entity: 'RentalContract',
      entityId: contract.id,
      details: `Signed contract ${contract.contractNumber} online`,
    });

    return { message: 'Contract electronically signed successfully.', contractId: contract.id };
  }

  async uploadSignedContractDocument(
    contractId: string,
    userId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  ) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
      include: { versions: { orderBy: { versionNumber: 'desc' } } },
    });

    if (!contract) throw new NotFoundException('Contract not found.');
    if (contract.customerId !== userId) throw new ForbiddenException('Only the customer can upload the signed contract.');

    const latestVersion = contract.versions[0];
    const fileExt = file.originalname.split('.').pop();
    const storagePath = `${userId}/${contract.contractNumber}_v${latestVersion.versionNumber}_offline_signed.${fileExt}`;

    await this.storageService.uploadFile(this.SIGNED_BUCKET_NAME, storagePath, file.buffer, file.mimetype);

    await this.prisma.contractDocument.create({
      data: {
        contractId,
        versionId: latestVersion.id,
        fileName: file.originalname,
        filePath: storagePath,
        fileSize: file.size,
      },
    });

    await this.prisma.rentalContract.update({
      where: { id: contractId },
      data: { status: 'UPLOADED_BY_CUSTOMER' },
    });

    await this.prisma.contractAuditEvent.create({
      data: {
        contractId,
        userId,
        action: 'SIGNED_DOCUMENT_UPLOADED',
        details: `Uploaded signed document file ${file.originalname}`,
      },
    });

    await this.notificationsService.createNotificationForRole('STAFF', {
      title: 'Offline Signed Contract Uploaded',
      message: `Customer uploaded offline signed contract for ${contract.contractNumber}.`,
      type: 'SIGNED_CONTRACT_UPLOADED',
      linkUrl: `/staff/contracts/${contractId}`,
    });

    return { message: 'Signed contract uploaded successfully.', contractId };
  }

  async reviewContract(contractId: string, reviewerId: string, approved: boolean, rejectionReason?: string) {
    const contract = await this.prisma.rentalContract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found.');

    const newStatus: ContractStatus = approved ? 'VERIFIED' : 'REJECTED';

    await this.prisma.rentalContract.update({
      where: { id: contractId },
      data: { status: newStatus },
    });

    await this.prisma.contractReview.create({
      data: {
        contractId,
        reviewerId,
        status: newStatus,
        rejectionReason: approved ? null : rejectionReason,
      },
    });

    await this.prisma.contractAuditEvent.create({
      data: {
        contractId,
        userId: reviewerId,
        action: approved ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
        details: approved ? 'Contract verified and approved by admin/staff.' : `Rejected: ${rejectionReason}`,
      },
    });

    await this.notificationsService.createNotification({
      userId: contract.customerId,
      title: approved ? 'Contract Approved' : 'Contract Rejected',
      message: approved
        ? `Your rental contract ${contract.contractNumber} has been approved.`
        : `Your contract ${contract.contractNumber} was rejected: ${rejectionReason}. Please review and re-sign.`,
      type: approved ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
      linkUrl: `/customer/contracts/${contractId}`,
    });

    await this.auditService.log({
      userId: reviewerId,
      action: approved ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
      entity: 'RentalContract',
      entityId: contractId,
      details: approved ? 'Approved contract' : `Rejected: ${rejectionReason}`,
    });

    return { status: newStatus };
  }

  async findAllContracts(status?: ContractStatus) {
    const contracts = await this.prisma.rentalContract.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true, cnicPassport: true, licenseNumber: true } },
        booking: {
          include: {
            customer: true,
            car: true,
            pickupLocation: true,
            returnLocation: true,
            services: { include: { service: true } },
            invoices: true,
            payments: true,
          },
        },
        versions: { orderBy: { versionNumber: 'desc' } },
        signatures: { include: { user: { select: { fullName: true } } } },
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      contracts.map(async (contract) => {
        const latestVersion = contract.versions[0];
        let pdfUrl = null;
        if (latestVersion && latestVersion.pdfFilePath) {
          const bucket = contract.status === 'SIGNED_BY_CUSTOMER' || contract.status === 'VERIFIED' ? this.SIGNED_BUCKET_NAME : this.BUCKET_NAME;
          pdfUrl = await this.storageService.getSignedUrl(bucket, latestVersion.pdfFilePath, 3600);
        }
        return { ...contract, pdfUrl };
      }),
    );
  }
}
