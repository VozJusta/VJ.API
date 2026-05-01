import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class DeleteNotificationsByIdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async deleteOne(userId: string, role: string, notificationId: string) {
    if (!notificationId) {
      throw new BadRequestException('notificationId é obrigatório');
    }

    const ownerField = role === 'Citizen' ? 'citizen_id' : 'lawyer_id';

    const result = await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        [ownerField]: userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notificação não encontrada');
    }

    this.notificationsGateway.emitNotificationsDeleted(
      { role: role as 'Citizen' | 'Lawyer', sub: userId },
      { deleted: result.count, notificationIds: [notificationId] },
    );

    return { ok: true, deleted: result.count };
  }
}
