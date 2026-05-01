import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationNotificationsDTO } from '@m/notifications/dto/pagination-notifications.dto';

@Injectable()
export class ListAllNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(
    userId: string,
    role: string,
    pagination: PaginationNotificationsDTO,
  ) {
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
      const citizenExists = await this.prisma.citizen.findUnique({
        where: { id: userId },
      });

      if (!citizenExists) {
        throw new NotFoundException('Cidadão não encontrado');
      }

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

      if (total === 0) {
        throw new NotFoundException('Nenhuma notificação encontrada');
      }

      return { items, total, page, pageSize };
    }

    if (userRole === 'lawyer') {
      const lawyerExists = await this.prisma.lawyer.findUnique({
        where: { id: userId },
      });

      if (!lawyerExists) {
        throw new NotFoundException('Advogado não encontrado');
      }

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

      if (total === 0) {
        throw new NotFoundException('Nenhuma notificação encontrada');
      }

      return { items, total, page, pageSize };
    }

    throw new ForbiddenException(
      'Role não autorizada para acessar notificações',
    );
  }
}
