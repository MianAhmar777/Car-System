import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
  }) {
    this.logger.log(`Sending notification to User ${params.userId}: ${params.title}`);
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        linkUrl: params.linkUrl,
      },
    });
  }

  async createNotificationForRole(roleName: string, params: {
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
  }) {
    const users = await this.prisma.user.findMany({
      where: { role: { name: roleName.toUpperCase() } },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      title: params.title,
      message: params.message,
      type: params.type,
      linkUrl: params.linkUrl,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
