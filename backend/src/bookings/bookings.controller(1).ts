import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BookingsService, CreateBookingDto } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { BookingStatus } from '@prisma/client';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async createBooking(@GetUser('id') customerId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(customerId, dto);
  }

  @Get('my-bookings')
  async getMyBookings(@GetUser('id') customerId: string) {
    return this.bookingsService.findCustomerBookings(customerId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async getAllBookings(@Query('status') status?: BookingStatus) {
    return this.bookingsService.findAllBookings(status);
  }

  @Get(':id')
  async getBooking(@Param('id') id: string, @GetUser() user: any) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('reason') reason: string,
    @GetUser() user: any,
  ) {
    return this.bookingsService.updateBookingStatus(id, status, user, reason);
  }
}
