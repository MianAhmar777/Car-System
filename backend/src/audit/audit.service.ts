import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          details: params.details,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${error.message}`);
    }
  }

  async findAll(query?: { userId?: string; action?: string; limit?: number }) {
    const limit = query?.limit || 100;
    return this.prisma.auditLog.findMany({
      where: {
        userId: query?.userId,
        action: query?.action ? { contains: query.action } : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
