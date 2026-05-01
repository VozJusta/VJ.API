import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class ReadOneNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async markAsRead(userId: string, role: string, notificationId: string) {
    if (!notificationId) {
      throw new BadRequestException('notificationId é obrigatório');
    }

    const ownerField = role === 'Citizen' ? 'citizen_id' : 'lawyer_id';

    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      select: {
        id: true,
        is_read: true,
        citizen_id: true,
        lawyer_id: true,
      },
    });

    if (!notification || notification[ownerField] !== userId) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (notification.is_read) {
      throw new BadRequestException('Notificação já está lida');
    }

    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });


    this.notificationsGateway.emitNotificationsUpdated(
      { role: role as 'Citizen' | 'Lawyer', sub: userId },
      { updated: 1, notificationIds: [notificationId] },
    );

    return { ok: true, updated: 1 };
  }
}
