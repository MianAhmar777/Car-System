import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DocumentType, VerificationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  private readonly BUCKET_NAME = 'customer-documents';

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async uploadCustomerDocument(
    userId: string,
    documentType: DocumentType,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  ) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new BadRequestException('File size exceeds the 10MB limit.');
    }

    const fileExt = file.originalname.split('.').pop();
    const storagePath = `${userId}/${documentType.toLowerCase()}_${Date.now()}.${fileExt}`;

    await this.storageService.uploadFile(this.BUCKET_NAME, storagePath, file.buffer, file.mimetype);

    // Create or update customer document record in MySQL
    const documentRecord = await this.prisma.customerDocument.create({
      data: {
        userId,
        documentType,
        fileName: file.originalname,
        filePath: storagePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        verificationStatus: 'PENDING',
      },
    });

    await this.notificationsService.createNotificationForRole('STAFF', {
      title: 'New Customer Document Uploaded',
      message: `Customer uploaded a new ${documentType} document for verification.`,
      type: 'DOCUMENT_UPLOADED',
      linkUrl: `/staff/documents`,
    });

    await this.auditService.log({
      userId,
      action: 'CUSTOMER_DOCUMENT_UPLOADED',
      entity: 'CustomerDocument',
      entityId: documentRecord.id,
      details: `Uploaded ${documentType} document`,
    });

    return documentRecord;
  }

  async getUserDocuments(userId: string) {
    const docs = await this.prisma.customerDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });

    // Attach temporary private signed URLs
    return Promise.all(
      docs.map(async (doc) => {
        const signedUrl = await this.storageService.getSignedUrl(this.BUCKET_NAME, doc.filePath, 3600);
        return { ...doc, signedUrl };
      }),
    );
  }

  async getAllDocuments(status?: VerificationStatus) {
    const docs = await this.prisma.customerDocument.findMany({
      where: status ? { verificationStatus: status } : undefined,
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return Promise.all(
      docs.map(async (doc) => {
        const signedUrl = await this.storageService.getSignedUrl(this.BUCKET_NAME, doc.filePath, 3600);
        return { ...doc, signedUrl };
      }),
    );
  }

  async verifyDocument(documentId: string, reviewerId: string, approved: boolean, rejectionReason?: string) {
    const doc = await this.prisma.customerDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found.');

    const updated = await this.prisma.customerDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
        rejectionReason: approved ? null : rejectionReason,
        verifiedAt: new Date(),
      },
    });

    await this.notificationsService.createNotification({
      userId: doc.userId,
      title: approved ? 'Document Verified' : 'Document Rejected',
      message: approved
        ? `Your ${doc.documentType} document has been verified successfully.`
        : `Your ${doc.documentType} document was rejected: ${rejectionReason}`,
      type: approved ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      linkUrl: `/customer/documents`,
    });

    await this.auditService.log({
      userId: reviewerId,
      action: approved ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      entity: 'CustomerDocument',
      entityId: doc.id,
      details: approved ? 'Verified document' : `Rejected document: ${rejectionReason}`,
    });

    return updated;
  }
}
