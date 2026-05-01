import { Injectable } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class DeleteAllNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async deleteAll(userId: string, role: string) {
    const ownerField = role === 'Citizen' ? 'citizen_id' : 'lawyer_id';

    const result = await this.prisma.notification.deleteMany({
      where: {
        [ownerField]: userId,
      },
    });

    if (result.count > 0) {
      this.notificationsGateway.emitNotificationsDeleted(
        { role: role as 'Citizen' | 'Lawyer', sub: userId },
        { deleted: result.count, notificationIds: [] },
      );
    }

    return { ok: true, deleted: result.count };
  }
}
