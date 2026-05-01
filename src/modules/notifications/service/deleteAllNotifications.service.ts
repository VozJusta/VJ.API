import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class DeleteAllNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async deleteAll(userId: string, role: string) {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório');
    }

    if (role !== 'Citizen' && role !== 'Lawyer') {
      throw new ForbiddenException('Role não autorizada para excluir notificações');
    }

    const ownerField = role === 'Citizen' ? 'citizen_id' : 'lawyer_id';

    const total = await this.prisma.notification.count({
      where: {
        [ownerField]: userId,
      },
    });

    if (total === 0) {
      throw new NotFoundException('Nenhuma notificação encontrada para remover');
    }

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
