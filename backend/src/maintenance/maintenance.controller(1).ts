import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async getMaintenanceRecords() {
    return this.maintenanceService.findAll();
  }

  @Post()
  async createMaintenance(@Body() body: any) {
    return this.maintenanceService.create(body);
  }

  @Patch(':id/complete')
  async completeMaintenance(@Param('id') id: string) {
    return this.maintenanceService.completeMaintenance(id);
  }
}
