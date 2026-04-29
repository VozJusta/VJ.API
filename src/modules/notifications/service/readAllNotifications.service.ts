import { PrismaService } from '@modules/prisma/service/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PaginationNotificationsDTO } from '../dto/pagination-notifications.dto';

@Injectable()
export class ReadAllNotifications {
  constructor(private readonly prisma: PrismaService) {}

  async readAll(userId: string, role: string, pagination: PaginationNotificationsDTO) {
    const userRole = role?.toLowerCase?.() ?? '';

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const select = {
      id: true,
      title: true,
      body: true,
      type: true,
      is_read: true,
      created_at: true,
    } as const;

    if (userRole === 'citizen') {
      const where = { citizen_id: userId };

      const [items, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          select,
          skip,
          take: pageSize,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return { items, total, page, pageSize };
    }

    if (userRole === 'lawyer') {
      const where = { lawyer_id: userId };

      const [items, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          select,
          skip,
          take: pageSize,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return { items, total, page, pageSize };
    }

    throw new ForbiddenException('Role não autorizada para acessar notificações');
  }
}
