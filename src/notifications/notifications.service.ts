import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FcmProvider } from './fcm.provider';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmProvider: FcmProvider,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: dto,
    });

    await this.fcmProvider.send({
      userId: dto.userId,
      title: dto.title,
      body: dto.message,
    });

    return notification;
  }

  /**
   * Fan-out helper used by the matching workflow to notify many compatible
   * donors at once when an emergency blood request is created.
   */
  async notifyMany(
    userIds: string[],
    title: string,
    message: string,
  ): Promise<void> {
    if (userIds.length === 0) return;

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, title, message })),
    });

    await this.fcmProvider.sendBatch(
      userIds.map((userId) => ({ userId, title, body: message })),
    );
  }

  async findForUser(userId: string, pagination: PaginationDto) {
    const { skip, limit = 10 } = pagination;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page: pagination.page ?? 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
