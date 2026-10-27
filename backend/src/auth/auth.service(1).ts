import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../notifications/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    // Default role for registration is CUSTOMER
    let customerRole = await this.prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: { name: 'CUSTOMER', description: 'Default Customer Role', isSystem: true },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        cnicPassport: dto.cnicPassport,
        licenseNumber: dto.licenseNumber,
        roleId: customerRole.id,
        isVerified: false,
        otpCode,
        otpExpiresAt,
      },
      include: { role: true },
    });

    this.logger.log(`User registered: ${user.email}. OTP: [${otpCode}] dispatched.`);

    await this.emailService.sendOtpEmail(user.email, otpCode, user.fullName);

    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      details: `User registered with email ${user.email}`,
    });

    return {
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
      message: 'Registration successful. A 6-digit OTP verification code has been sent to your email.',
    };
  }

  async registerAdmin(dto: RegisterDto & { adminSecretKey?: string }) {
    const secret = this.configService.get<string>('ADMIN_SECRET_KEY', 'DriveEliteAdminSecret2026!');
    if (!dto.adminSecretKey || dto.adminSecretKey !== secret) {
      throw new UnauthorizedException('Invalid or missing Admin Security Passcode.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    let adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: { name: 'ADMIN', description: 'System Administrator Role', isSystem: true },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        cnicPassport: dto.cnicPassport,
        licenseNumber: dto.licenseNumber,
        roleId: adminRole.id,
        isVerified: false,
        otpCode,
        otpExpiresAt,
      },
      include: { role: true },
    });

    this.logger.log(`Admin user registered: ${user.email}. OTP: [${otpCode}] dispatched.`);

    await this.emailService.sendOtpEmail(user.email, otpCode, user.fullName);

    await this.auditService.log({
      userId: user.id,
      action: 'ADMIN_REGISTERED',
      details: `Admin registered with email ${user.email}`,
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      isVerified: user.isVerified,
      message: 'Admin account registration successful. A 6-digit OTP verification code has been sent to your email.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid email address.');
    }

    if (user.isVerified) {
      return { message: 'Account is already verified. Please login.' };
    }

    if (user.otpAttempts >= 5) {
      throw new BadRequestException('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }

    if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new code.');
    }

    if (user.otpCode !== dto.otpCode) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP code.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'USER_VERIFIED_OTP',
      details: 'Account successfully verified via OTP.',
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    return {
      message: 'Account verified successfully.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
      },
      ...tokens,
    };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt, otpAttempts: 0 },
    });

    this.logger.log(`Resent OTP to ${user.email}. OTP: [${otpCode}]`);
    await this.emailService.sendOtpEmail(user.email, otpCode, user.fullName);

    return {
      message: 'A new 6-digit OTP verification code has been sent to your email address.',
    };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('No account found with this email address. Please check your email or create a new account.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect password. Please check your password and try again.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Account not verified. Please complete OTP verification to activate your account.');
    }

    const permissions = user.role.permissions.map((p) => p.permission.action);
    const tokens = await this.generateTokens(user.id, user.email, user.role.name);

    await this.auditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      ipAddress,
      details: `Successful login for ${user.email}`,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-jwt-refresh-key-car-rental-2026-production'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const match = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!match) {
        throw new UnauthorizedException('Invalid or rotated refresh token.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role.name);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired.');
    }
  }

  async demoLoginByRole(targetRole: 'ADMIN' | 'STAFF' | 'CUSTOMER', ipAddress?: string) {
    const roleEmailMap = {
      ADMIN: 'admin@carrental.com',
      STAFF: 'staff@carrental.com',
      CUSTOMER: 'john.doe@example.com',
    };
    const targetEmail = roleEmailMap[targetRole];

    let user = await this.prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { role: { name: targetRole }, deletedAt: null },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      });
    }

    if (!user) {
      throw new BadRequestException(`No active demo user found for role ${targetRole}`);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);

    await this.auditService.log({
      userId: user.id,
      action: 'DEMO_LOGIN_SUCCESS',
      details: `Demo login executed for role ${targetRole}`,
      ipAddress,
    });

    const permissionsList = user.role?.permissions?.map((p) => p.permission.action) || [];

    return {
      message: `Demo login successful as ${user.role.name}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: permissionsList,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    await this.auditService.log({
      userId,
      action: 'USER_LOGOUT',
      details: 'User logged out',
    });

    return { message: 'Logged out successfully.' };
  }

  private async generateTokens(userId: string, email: string, roleName: string) {
    const payload = { sub: userId, email, roleName };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'super-secret-jwt-key-car-rental-2026-production'),
      expiresIn: this.configService.get<any>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-jwt-refresh-key-car-rental-2026-production'),
      expiresIn: this.configService.get<any>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
