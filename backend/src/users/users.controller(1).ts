import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  async getAllUsers(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get('profile')
  async getMyProfile(@GetUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() body: { fullName?: string; phone?: string; cnicPassport?: string; licenseNumber?: string; address?: string },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  async updateUserRole(@Param('id') id: string, @Body('roleId') roleId: string) {
    return this.usersService.updateUserRole(id, roleId);
  }
}
