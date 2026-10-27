import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('PricingService', () => {
  let service: PricingService;
  let prisma: PrismaService;

  const mockPrisma = {
    car: {
      findUnique: jest.fn(),
    },
    additionalService: {
      findMany: jest.fn(),
    },
    discount: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate rental days correctly', () => {
    const p = new Date('2026-10-01T10:00:00Z');
    const r = new Date('2026-10-04T10:00:00Z');
    expect(service.calculateDays(p, r)).toBe(3);
  });

  it('should calculate base price with daily rate and 10% tax', async () => {
    mockPrisma.car.findUnique.mockResolvedValue({
      id: 'car-1',
      dailyRate: 50,
      weeklyRate: null,
      monthlyRate: null,
      securityDeposit: 200,
      status: 'AVAILABLE',
    });
    mockPrisma.additionalService.findMany.mockResolvedValue([]);

    const result = await service.calculatePrice({
      carId: 'car-1',
      pickupDateTime: new Date('2026-10-01T10:00:00Z'),
      returnDateTime: new Date('2026-10-03T10:00:00Z'), // 2 days
    });

    expect(result.rentalDays).toBe(2);
    expect(result.basePrice).toBe(100);
    expect(result.taxAmount).toBe(10);
    expect(result.totalAmount).toBe(110);
    expect(result.securityDeposit).toBe(200);
  });

  it('should apply discount codes correctly', async () => {
    mockPrisma.car.findUnique.mockResolvedValue({
      id: 'car-1',
      dailyRate: 100,
      securityDeposit: 300,
      status: 'AVAILABLE',
    });
    mockPrisma.additionalService.findMany.mockResolvedValue([]);
    mockPrisma.discount.findUnique.mockResolvedValue({
      id: 'disc-15',
      code: 'SUMMER15',
      percentage: 15,
      isActive: true,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
      usageLimit: 100,
      timesUsed: 5,
    });

    const result = await service.calculatePrice({
      carId: 'car-1',
      pickupDateTime: new Date('2026-10-01T10:00:00Z'),
      returnDateTime: new Date('2026-10-02T10:00:00Z'), // 1 day = $100
      discountCode: 'SUMMER15',
    });

    expect(result.basePrice).toBe(100);
    expect(result.discountAmount).toBe(15);
    expect(result.taxAmount).toBe(8.5); // 10% of (100 - 15)
    expect(result.totalAmount).toBe(93.5);
  });
});
