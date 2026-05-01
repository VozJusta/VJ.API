import { Injectable } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class ReadAllNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async markAllAsRead(userId: string, role: string) {
    const ownerField = role === 'Citizen' ? 'citizen_id' : 'lawyer_id';

    const result = await this.prisma.notification.updateMany({
      where: {
        [ownerField]: userId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    this.notificationsGateway.emitNotificationsUpdated(
      { role: role as 'Citizen' | 'Lawyer', sub: userId },
      { updated: result.count },
    );

    return { ok: true, updated: result.count };
  }
}
