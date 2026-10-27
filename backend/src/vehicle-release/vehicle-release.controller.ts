import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VehicleReleaseService } from './vehicle-release.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('vehicle-release')
@UseGuards(JwtAuthGuard)
export class VehicleReleaseController {
  constructor(private readonly releaseService: VehicleReleaseService) {}

  @Get('checklist/:bookingId')
  async getReleaseChecklist(@Param('bookingId') bookingId: string) {
    return this.releaseService.checkReleaseChecklist(bookingId);
  }

  @Get('authorization/:bookingId')
  async getAuthorization(@Param('bookingId') bookingId: string) {
    return this.releaseService.findReleaseAuthorization(bookingId);
  }

  @Post('authorize/:bookingId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async authorizeRelease(
    @Param('bookingId') bookingId: string,
    @GetUser('id') staffId: string,
    @Body('overrideReason') overrideReason?: string,
  ) {
    return this.releaseService.authorizeVehicleRelease(bookingId, staffId, overrideReason);
  }
}
