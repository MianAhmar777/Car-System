import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.reportsService.getAdminDashboardStats();
  }

  @Get('activity')
  async getRecentActivity() {
    return this.reportsService.getRecentActivity();
  }
}
