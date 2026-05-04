import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from 'generated/prisma/client';
import { NotificationModel } from 'generated/prisma/models/Notification';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

type NotificationTarget = {
  role: 'Citizen' | 'Lawyer';
  userId: string;
};

type CreateNotificationInput = {
  target: NotificationTarget;
  title: string;
  body: string;
  type: NotificationType;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationModel> {
    const notification = await this.prisma.notification.create({
      data:
        input.target.role === 'Citizen'
          ? {
              title: input.title,
              body: input.body,
              type: input.type,
              metadata: input.metadata,
              citizen_id: input.target.userId,
            }
          : {
              title: input.title,
              body: input.body,
              type: input.type,
              metadata: input.metadata,
              lawyer_id: input.target.userId,
            },
    });

    this.notificationsGateway.emitNotification(
      { role: input.target.role, sub: input.target.userId },
      notification,
    );
    return notification;
  }
}
