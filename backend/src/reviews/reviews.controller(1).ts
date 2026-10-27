import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@GetUser('id') userId: string, @Body() body: { bookingId: string; rating: number; comment?: string }) {
    return this.reviewsService.createReview(userId, body);
  }

  @Get('car/:carId')
  async getCarReviews(@Param('carId') carId: string) {
    return this.reviewsService.getCarReviews(carId);
  }
}
