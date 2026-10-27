import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { BookingsService } from '../src/bookings/bookings.service';
import { PaymentsService } from '../src/payments/payments.service';
import { DocumentsService } from '../src/documents/documents.service';
import { ContractsService } from '../src/contracts/contracts.service';
import { VehicleReleaseService } from '../src/vehicle-release/vehicle-release.service';
import { InspectionsService } from '../src/inspections/inspections.service';
import { ReviewsService } from '../src/reviews/reviews.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../src/storage/storage.service';
import { PdfGeneratorService } from '../src/contracts/pdf-generator.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { AuditService } from '../src/audit/audit.service';
import { PricingService } from '../src/pricing/pricing.service';

describe('Full End-to-End Customer Rental Lifecycle Journey', () => {
  let authService: AuthService;
  let bookingsService: BookingsService;
  let paymentsService: PaymentsService;
  let documentsService: DocumentsService;
  let contractsService: ContractsService;
  let releaseService: VehicleReleaseService;
  let inspectionsService: InspectionsService;
  let reviewsService: ReviewsService;

  // In-memory mock database state
  const state: any = {
    users: [],
    roles: [
      { id: 'role-customer', name: 'CUSTOMER', permissions: [] },
      { id: 'role-staff', name: 'STAFF', permissions: [] },
    ],
    cars: [
      {
        id: 'car-bmw-1',
        registrationNumber: 'E2E-BMW-001',
        make: 'BMW',
        model: '5 Series',
        year: 2025,
        dailyRate: 150,
        securityDeposit: 500,
        status: 'AVAILABLE',
        deletedAt: null,
      },
    ],
    bookings: [],
    payments: [],
    documents: [],
    contracts: [],
    releaseAuths: [],
    inspections: [],
    invoices: [],
    reviews: [],
  };

  const mockPrismaService = {
    $transaction: jest.fn((arg) => (typeof arg === 'function' ? arg(mockPrismaService) : Promise.all(arg))),
    user: {
      findUnique: jest.fn(({ where }) => state.users.find((u) => u.email === where.email || u.id === where.id) || null),
      findMany: jest.fn(({ where }) => {
        if (where?.role?.name) {
          return state.users.filter((u) => u.role?.name === where.role.name);
        }
        return state.users;
      }),
      create: jest.fn(({ data }) => {
        const u = { id: `user-${Date.now()}`, ...data, role: state.roles.find((r) => r.id === data.roleId) };
        state.users.push(u);
        return u;
      }),
      update: jest.fn(({ where, data }) => {
        const u = state.users.find((user) => user.id === where.id);
        if (u) Object.assign(u, data);
        return u;
      }),
    },
    role: {
      findUnique: jest.fn(({ where }) => state.roles.find((r) => r.name === where.name) || null),
      create: jest.fn(({ data }) => ({ id: `role-${data.name.toLowerCase()}`, ...data })),
    },
    car: {
      findUnique: jest.fn(({ where }) => state.cars.find((c) => c.id === where.id) || null),
      update: jest.fn(({ where, data }) => {
        const c = state.cars.find((car) => car.id === where.id);
        if (c) Object.assign(c, data);
        return c;
      }),
    },
    booking: {
      findFirst: jest.fn(() => null),
      findUnique: jest.fn(({ where }) => state.bookings.find((b) => b.id === where.id) || null),
      create: jest.fn(({ data }) => {
        const b = {
          id: `bk-${Date.now()}`,
          ...data,
          customer: state.users.find((u) => u.id === data.customerId),
          car: state.cars.find((c) => c.id === data.carId),
          pickupLocation: { name: 'JFK Airport Central Hub' },
          returnLocation: { name: 'JFK Airport Central Hub' },
          payments: [],
          rentalContracts: [],
          inspections: [],
          invoices: [],
        };
        state.bookings.push(b);
        return b;
      }),
      update: jest.fn(({ where, data }) => {
        const b = state.bookings.find((bk) => bk.id === where.id);
        if (b) Object.assign(b, data);
        return b;
      }),
    },
    invoice: {
      create: jest.fn(({ data }) => {
        const inv = { id: `inv-${Date.now()}`, ...data };
        state.invoices.push(inv);
        return inv;
      }),
      update: jest.fn(({ where, data }) => {
        const inv = state.invoices.find((i) => i.id === where.id);
        if (inv) Object.assign(inv, data);
        return inv;
      }),
      updateMany: jest.fn(),
    },
    discount: {
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(({ data }) => {
        const p = { id: `pay-${Date.now()}`, ...data };
        state.payments.push(p);
        const b = state.bookings.find((bk) => bk.id === data.bookingId);
        if (b) b.payments.push(p);
        return p;
      }),
    },
    customerDocument: {
      create: jest.fn(({ data }) => {
        const d = { id: `doc-${Date.now()}`, ...data };
        state.documents.push(d);
        const u = state.users.find((user) => user.id === data.userId);
        if (u) {
          u.customerDocuments = u.customerDocuments || [];
          u.customerDocuments.push(d);
        }
        return d;
      }),
      findUnique: jest.fn(({ where }) => state.documents.find((d) => d.id === where.id) || null),
      update: jest.fn(({ where, data }) => {
        const d = state.documents.find((doc) => doc.id === where.id);
        if (d) Object.assign(d, data);
        return d;
      }),
    },
    contractTemplate: {
      findFirst: jest.fn().mockResolvedValue({ id: 'tmpl-1', title: 'Terms', bodyText: 'Standard Rental Terms', version: 1 }),
      create: jest.fn(),
    },
    rentalContract: {
      findUnique: jest.fn(({ where }) => state.contracts.find((c) => c.id === where.id) || null),
      create: jest.fn(({ data }) => {
        const v = data.versions?.create
          ? Array.isArray(data.versions.create)
            ? data.versions.create
            : [data.versions.create]
          : [{ id: 'v-1', versionNumber: 1, contentSnapshot: 'Terms' }];
        const versions = v.map((item, idx) => ({ id: `v-${idx + 1}`, versionNumber: item.versionNumber || 1, contentSnapshot: item.contentSnapshot || 'Terms', ...item }));
        const b = state.bookings.find((bk) => bk.id === data.bookingId);
        const c = { id: `contract-${Date.now()}`, ...data, booking: b, versions, status: data.status || 'PENDING_SIGNATURE' };
        state.contracts.push(c);
        if (b) b.rentalContracts.push(c);
        return c;
      }),
      update: jest.fn(({ where, data }) => {
        const c = state.contracts.find((con) => con.id === where.id);
        if (c) Object.assign(c, data);
        return c;
      }),
    },
    contractSignature: {
      create: jest.fn(),
    },
    contractDocument: {
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
    vehicleReleaseAuthorization: {
      upsert: jest.fn(({ update, create }) => {
        const auth = { id: 'auth-1', ...create, ...update, isAuthorized: true };
        state.releaseAuths.push(auth);
        return auth;
      }),
      findUnique: jest.fn(({ where }) => state.releaseAuths.find((a) => a.bookingId === where.bookingId) || null),
    },
    vehicleInspection: {
      create: jest.fn(({ data }) => {
        const ins = { id: `ins-${Date.now()}`, ...data };
        state.inspections.push(ins);
        const b = state.bookings.find((bk) => bk.id === data.bookingId);
        if (b) b.inspections.push(ins);
        return ins;
      }),
      findMany: jest.fn(({ where }) => state.inspections.filter((i) => i.bookingId === where.bookingId)),
    },
    review: {
      findUnique: jest.fn(({ where }) => state.reviews.find((r) => r.bookingId === where.bookingId) || null),
      create: jest.fn(({ data }) => {
        const r = { id: `rev-${Date.now()}`, ...data };
        state.reviews.push(r);
        return r;
      }),
    },
    auditLog: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn().mockResolvedValue({ path: 'uploads/file.pdf' }),
    getSignedUrl: jest.fn().mockResolvedValue('https://storage.signed/file.pdf'),
  };

  const mockPdfGenerator = {
    generateContractPdf: jest.fn().mockResolvedValue({
      pdfBuffer: Buffer.from('PDF Content'),
      checksum: 'hash-checksum-12345',
    }),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => defaultValue || key),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        BookingsService,
        PaymentsService,
        DocumentsService,
        ContractsService,
        VehicleReleaseService,
        InspectionsService,
        ReviewsService,
        PricingService,
        JwtService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: PdfGeneratorService, useValue: mockPdfGenerator },
        { provide: ConfigService, useValue: mockConfigService },
        NotificationsService,
        AuditService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    bookingsService = module.get<BookingsService>(BookingsService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    documentsService = module.get<DocumentsService>(DocumentsService);
    contractsService = module.get<ContractsService>(ContractsService);
    releaseService = module.get<VehicleReleaseService>(VehicleReleaseService);
    inspectionsService = module.get<InspectionsService>(InspectionsService);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  it('Executes the complete 16-step Customer Rental Journey seamlessly', async () => {
    // Step 1: Customer Registration
    const regRes = await authService.register({
      fullName: 'Alice Customer',
      email: 'alice.e2e@example.com',
      password: 'Password123!',
      phone: '+1-555-0999',
      licenseNumber: 'DL-ALICE-123',
    });
    expect(regRes.userId).toBeDefined();

    // Step 2: OTP Account Verification
    const verifyRes = await authService.verifyOtp({
      email: 'alice.e2e@example.com',
      otpCode: regRes.otpCode,
    });
    expect(verifyRes.message).toBe('Account verified successfully.');
    expect('user' in verifyRes).toBe(true);
    if (!('user' in verifyRes)) return;
    const customerId = verifyRes.user.id;

    // Step 3: Customer Creates Reservation
    const booking = await bookingsService.createBooking(customerId, {
      carId: 'car-bmw-1',
      pickupLocationId: 'loc-jfk',
      returnLocationId: 'loc-jfk',
      pickupDateTime: '2026-11-01T10:00:00Z',
      returnDateTime: '2026-11-04T10:00:00Z', // 3 days @ $150 = $450 base + $45 tax = $495 total
    });
    expect(booking.id).toBeDefined();
    expect(booking.status).toBe('PENDING');

    // Step 4: Customer Pays Total Amount & Security Deposit
    const payment = await paymentsService.processPayment(customerId, {
      bookingId: booking.id,
      amount: 495 + 500, // Total + Deposit
    });
    expect(payment.status).toBe('SUCCESS');

    // Step 5: Customer Uploads Driving License Document
    const doc = await documentsService.uploadCustomerDocument(customerId, 'DRIVING_LICENSE' as any, {
      originalname: 'license.pdf',
      buffer: Buffer.from('mock license'),
      mimetype: 'application/pdf',
      size: 1024,
    });
    expect(doc.id).toBeDefined();

    // Step 6: Staff Verifies Customer Identity Document
    const verifiedDoc = await documentsService.verifyDocument(doc.id, 'staff-user-id', true);
    expect(verifiedDoc.verificationStatus).toBe('VERIFIED');

    // Step 7: System Generates Dynamic Versioned Rental Contract
    const contract = await contractsService.generateContractForBooking(booking.id);
    expect(contract.id).toBeDefined();
    expect(contract.status).toBe('PENDING_SIGNATURE');

    // Step 8: Customer Signs Contract Online (E-Signature)
    const signRes = await contractsService.signContractOnline(
      contract.id,
      customerId,
      'data:image/png;base64,AliceSignatureData',
      '127.0.0.1',
    );
    expect(signRes.message).toBe('Contract electronically signed successfully.');

    // Step 9: Staff Reviews & Approves Signed Contract
    const approvedContract = await contractsService.reviewContract(contract.id, 'staff-user-id', true);
    expect(approvedContract.status).toBe('VERIFIED');

    // Step 10: Staff Performs Pre-Pickup Vehicle Inspection
    const pickupIns = await inspectionsService.createInspection('staff-user-id', {
      bookingId: booking.id,
      carId: 'car-bmw-1',
      type: 'PICKUP' as any,
      mileage: 5000,
      fuelLevel: 100,
      existingDamage: 'Minor scratch on rear bumper',
    });
    expect(pickupIns.id).toBeDefined();

    // Step 11: Staff Authorizes Vehicle Release
    const releaseAuth = await releaseService.authorizeVehicleRelease(booking.id, 'staff-user-id');
    expect(releaseAuth.isAuthorized).toBe(true);

    // Step 12: Vehicle Handover Processed -> Car Status = RENTED, Booking = PICKED_UP
    const carAfterPickup = state.cars.find((c) => c.id === 'car-bmw-1');
    expect(carAfterPickup.status).toBe('RENTED');

    // Step 13: Customer Returns Vehicle & Staff Performs Return Inspection
    const returnIns = await inspectionsService.createInspection('staff-user-id', {
      bookingId: booking.id,
      carId: 'car-bmw-1',
      type: 'RETURN' as any,
      mileage: 5400,
      fuelLevel: 100,
      notes: 'Returned in pristine condition',
    });
    expect(returnIns.id).toBeDefined();

    // Step 14: Car Status Returns to AVAILABLE & Booking = RETURNED
    const carAfterReturn = state.cars.find((c) => c.id === 'car-bmw-1');
    expect(carAfterReturn.status).toBe('AVAILABLE');

    // Step 15: Staff Completes Booking
    const completedBooking = await bookingsService.updateBookingStatus(booking.id, 'COMPLETED' as any, { id: 'staff-user-id', roleName: 'STAFF' });
    expect(completedBooking.status).toBe('COMPLETED');

    // Step 16: Customer Submits Review for Completed Rental
    const review = await reviewsService.createReview(customerId, {
      bookingId: booking.id,
      rating: 5,
      comment: 'Excellent BMW 5 Series! Seamless handover and contract e-signing.',
    });
    expect(review.id).toBeDefined();
    expect(review.rating).toBe(5);
  });
});
