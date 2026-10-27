import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '../src/bookings/bookings.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { PricingService } from '../src/pricing/pricing.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { AuditService } from '../src/audit/audit.service';
import { BadRequestException } from '@nestjs/common';

describe('Availability Engine & Concurrency Overlap (Integration)', () => {
  let bookingsService: BookingsService;
  let prisma: PrismaService;

  const mockCar = {
    id: 'car-tesla-101',
    make: 'Tesla',
    model: 'Model Y',
    dailyRate: 100,
    securityDeposit: 300,
    status: 'AVAILABLE',
    deletedAt: null,
  };

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    car: {
      findUnique: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
    },
    discount: {
      update: jest.fn(),
    },
  };

  const mockPricingService = {
    calculatePrice: jest.fn().mockResolvedValue({
      rentalDays: 3,
      dailyRate: 100,
      basePrice: 300,
      servicesFee: 0,
      discountAmount: 0,
      taxAmount: 30,
      securityDeposit: 300,
      totalAmount: 330,
      serviceBreakdown: [],
    }),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PricingService, useValue: mockPricingService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('1. REJECTS booking when pickup date is after return date', async () => {
    await expect(
      bookingsService.createBooking('user-1', {
        carId: 'car-tesla-101',
        pickupLocationId: 'loc-1',
        returnLocationId: 'loc-1',
        pickupDateTime: '2026-10-15T10:00:00Z',
        returnDateTime: '2026-10-10T10:00:00Z', // Invalid date range
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('2. REJECTS booking when vehicle status is MAINTENANCE', async () => {
    mockPrismaService.car.findUnique.mockResolvedValue({
      ...mockCar,
      status: 'MAINTENANCE',
    });

    await expect(
      bookingsService.createBooking('user-1', {
        carId: 'car-tesla-101',
        pickupLocationId: 'loc-1',
        returnLocationId: 'loc-1',
        pickupDateTime: '2026-10-10T10:00:00Z',
        returnDateTime: '2026-10-13T10:00:00Z',
      }),
    ).rejects.toThrow('The selected vehicle is currently inactive or under maintenance.');
  });

  it('3. REJECTS overlapping booking when another active booking exists in database for target dates', async () => {
    mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
    mockPrismaService.booking.findFirst.mockResolvedValue({
      id: 'existing-booking-99',
      bookingReference: 'BK-EXISTING',
      carId: 'car-tesla-101',
      pickupDateTime: new Date('2026-10-08T10:00:00Z'),
      returnDateTime: new Date('2026-10-12T10:00:00Z'),
      status: 'CONFIRMED',
    });

    await expect(
      bookingsService.createBooking('user-2', {
        carId: 'car-tesla-101',
        pickupLocationId: 'loc-1',
        returnLocationId: 'loc-1',
        pickupDateTime: '2026-10-10T10:00:00Z', // Overlaps Oct 8-12
        returnDateTime: '2026-10-15T10:00:00Z',
      }),
    ).rejects.toThrow('Vehicle is not available for the selected dates. Another booking overlaps this timeframe.');
  });

  it('4. SUCCEEDS and locks booking when no date overlap exists', async () => {
    mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
    mockPrismaService.booking.findFirst.mockResolvedValue(null); // No overlap
    mockPrismaService.booking.create.mockResolvedValue({
      id: 'bk-new-100',
      bookingReference: 'BK-987654',
      customerId: 'user-1',
      carId: 'car-tesla-101',
      totalAmount: 330,
      securityDeposit: 300,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    const result = await bookingsService.createBooking('user-1', {
      carId: 'car-tesla-101',
      pickupLocationId: 'loc-1',
      returnLocationId: 'loc-1',
      pickupDateTime: '2026-10-20T10:00:00Z',
      returnDateTime: '2026-10-23T10:00:00Z',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING');
    expect(mockPrismaService.booking.create).toHaveBeenCalled();
  });
});
