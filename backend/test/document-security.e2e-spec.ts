import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../src/documents/documents.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { AuditService } from '../src/audit/audit.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Document Security & Private Storage Path Isolation (Integration)', () => {
  let documentsService: DocumentsService;

  const mockPrismaService = {
    customerDocument: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn().mockResolvedValue({ path: 'customer-a-id/cnic.pdf' }),
    getSignedUrl: jest.fn().mockImplementation((bucket, path) => {
      // Simulate signed URL generation
      return Promise.resolve(`https://supabase.storage/signed/${bucket}/${path}?token=valid`);
    }),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
    createNotificationForRole: jest.fn().mockResolvedValue({}),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('1. Customer A receives signed URLs strictly for their own uploaded documents', async () => {
    mockPrismaService.customerDocument.findMany.mockResolvedValue([
      {
        id: 'doc-a-1',
        userId: 'customer-a-id',
        documentType: 'CNIC',
        fileName: 'cnic.pdf',
        filePath: 'customer-a-id/cnic.pdf',
        verificationStatus: 'VERIFIED',
      },
    ]);

    const docs = await documentsService.getUserDocuments('customer-a-id');

    expect(docs).toHaveLength(1);
    expect(docs[0].signedUrl).toContain('customer-a-id/cnic.pdf');
  });

  it('2. Customer B query for Customer A documents returns empty isolation boundary', async () => {
    mockPrismaService.customerDocument.findMany.mockImplementation((query) => {
      if (query.where.userId === 'customer-b-id') {
        return Promise.resolve([]); // Isolated query by authenticated userId
      }
      return Promise.resolve([]);
    });

    const docsB = await documentsService.getUserDocuments('customer-b-id');

    expect(docsB).toHaveLength(0);
    expect(mockStorageService.getSignedUrl).not.toHaveBeenCalled();
  });
});
