import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, data: { bookingId: string; rating: number; comment?: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.customerId !== userId) throw new BadRequestException('Only the booking customer can leave a review.');

    if (booking.status !== 'COMPLETED' && booking.status !== 'RETURNED') {
      throw new BadRequestException('Reviews are only permitted for completed rentals.');
    }

    const existing = await this.prisma.review.findUnique({ where: { bookingId: data.bookingId } });
    if (existing) throw new BadRequestException('A review has already been submitted for this booking.');

    return this.prisma.review.create({
      data: {
        bookingId: data.bookingId,
        carId: booking.carId,
        userId,
        rating: Math.min(5, Math.max(1, Number(data.rating))),
        comment: data.comment,
      },
    });
  }

  async getCarReviews(carId: string) {
    return this.prisma.review.findMany({
      where: { carId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
