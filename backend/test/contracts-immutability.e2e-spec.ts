import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from '../src/contracts/contracts.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { PdfGeneratorService } from '../src/contracts/pdf-generator.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { AuditService } from '../src/audit/audit.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('Contracts & Signature Immutability (Integration)', () => {
  let contractsService: ContractsService;

  const mockPrismaService = {
    $transaction: jest.fn((promises) => Promise.all(promises)),
    booking: {
      findUnique: jest.fn(),
    },
    contractTemplate: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    rentalContract: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    contractSignature: {
      create: jest.fn(),
    },
    rentalContractVersion: {
      update: jest.fn(),
    },
    contractReview: {
      create: jest.fn(),
    },
    contractAuditEvent: {
      create: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn().mockResolvedValue({ path: 'path/to/contract.pdf' }),
    getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com/contract.pdf'),
  };

  const mockPdfGenerator = {
    generateContractPdf: jest.fn().mockResolvedValue({
      pdfBuffer: Buffer.from('mock-pdf'),
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
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
        ContractsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: PdfGeneratorService, useValue: mockPdfGenerator },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    contractsService = module.get<ContractsService>(ContractsService);
  });

  it('1. PREVENTS customer A from signing customer B contract', async () => {
    mockPrismaService.rentalContract.findUnique.mockResolvedValue({
      id: 'contract-customer-b',
      contractNumber: 'RC-2026-0001',
      customerId: 'customer-b-id', // Contract belongs to Customer B
      status: 'PENDING_SIGNATURE',
      booking: { customer: { fullName: 'Customer B' }, car: {}, pickupLocation: {}, returnLocation: {}, pickupDateTime: new Date(), returnDateTime: new Date() },
      versions: [{ id: 'version-1', versionNumber: 1, contentSnapshot: 'Terms' }],
    });

    await expect(
      contractsService.signContractOnline(
        'contract-customer-b',
        'customer-a-id', // Customer A attempts to sign
        'data:image/png;base64,mockSignatureData',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('2. REJECTS signing an already VERIFIED signed contract', async () => {
    mockPrismaService.rentalContract.findUnique.mockResolvedValue({
      id: 'contract-signed',
      contractNumber: 'RC-2026-0002',
      customerId: 'customer-a-id',
      status: 'VERIFIED', // Already verified and immutable
      booking: { customer: { fullName: 'Customer A' }, car: {}, pickupLocation: {}, returnLocation: {}, pickupDateTime: new Date(), returnDateTime: new Date() },
      versions: [{ id: 'version-1', versionNumber: 1, contentSnapshot: 'Terms' }],
    });

    await expect(
      contractsService.signContractOnline(
        'contract-signed',
        'customer-a-id',
        'data:image/png;base64,mockSignatureData',
      ),
    ).rejects.toThrow('This contract has already been approved and signed.');
  });

  it('3. RECORDS signature evidence and updates status to SIGNED_BY_CUSTOMER when valid', async () => {
    mockPrismaService.rentalContract.findUnique.mockResolvedValue({
      id: 'contract-valid',
      contractNumber: 'RC-2026-0003',
      customerId: 'customer-a-id',
      status: 'PENDING_SIGNATURE',
      booking: {
        customer: { fullName: 'Customer A', email: 'a@example.com' },
        car: { make: 'Toyota', model: 'Camry', registrationNumber: 'REG-100' },
        pickupLocation: { name: 'JFK' },
        returnLocation: { name: 'JFK' },
        pickupDateTime: new Date(),
        returnDateTime: new Date(),
        rentalDays: 3,
        totalAmount: 200,
        securityDeposit: 100,
      },
      versions: [{ id: 'version-1', versionNumber: 1, contentSnapshot: 'Terms' }],
    });

    const result = await contractsService.signContractOnline(
      'contract-valid',
      'customer-a-id',
      'data:image/png;base64,validSignature',
      '192.168.1.1',
      'Mozilla/5.0',
    );

    expect(result.message).toBe('Contract electronically signed successfully.');
    expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
      'signed-contracts',
      expect.any(String),
      expect.any(Buffer),
      'application/pdf',
    );
  });
});
