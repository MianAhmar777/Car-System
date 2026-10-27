import { Test, TestingModule } from '@nestjs/testing';
import { VehicleReleaseService } from './vehicle-release.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('VehicleReleaseService', () => {
  let service: VehicleReleaseService;

  const mockPrisma = {
    booking: {
      findUnique: jest.fn(),
    },
    vehicleReleaseAuthorization: {
      upsert: jest.fn(),
    },
  };

  const mockNotifications = {
    createNotification: jest.fn(),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleReleaseService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<VehicleReleaseService>(VehicleReleaseService);
  });

  it('should block vehicle release if contract is not approved and documents missing', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: 'b-1',
      status: 'CONFIRMED',
      carId: 'car-100',
      totalAmount: 300,
      securityDeposit: 100,
      paymentStatus: 'PENDING',
      customer: {
        fullName: 'John Doe',
        email: 'john@example.com',
        customerDocuments: [],
      },
      car: { registrationNumber: 'ABC-123', status: 'AVAILABLE' },
      payments: [],
      rentalContracts: [],
      inspections: [],
    });

    const result = await service.checkReleaseChecklist('b-1');

    expect(result.isAuthorizedToRelease).toBe(false);
    expect(result.checklist.contractApproved).toBe(false);
    expect(result.checklist.documentsVerified).toBe(false);
    expect(result.blockedReasons.length).toBeGreaterThan(0);
  });
});
