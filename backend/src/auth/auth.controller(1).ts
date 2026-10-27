import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-admin')
  async registerAdmin(@Body() dto: RegisterDto & { adminSecretKey?: string }) {
    return this.authService.registerAdmin(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, ip);
  }

  @Post('demo/admin')
  async demoAdmin(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.demoLoginByRole('ADMIN', ip);
  }

  @Post('demo/staff')
  async demoStaff(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.demoLoginByRole('STAFF', ip);
  }

  @Post('demo/customer')
  async demoCustomer(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.demoLoginByRole('CUSTOMER', ip);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: any) {
    return { user };
  }
}
