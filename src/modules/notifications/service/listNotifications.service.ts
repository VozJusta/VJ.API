import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
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
    const pageSize = Math.min(pagination?.pageSize ?? 2, 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Página inválida');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('PageSize inválido');
    }

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
        select: { id: true },
      });

      if (!citizenExists) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const where = { citizen_id: userId };

      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where,
          select,
          skip,
          take: pageSize,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      if (totalItems === 0) {
        throw new NotFoundException('Nenhuma notificação encontrada');
      }

      return {
        data: items,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: page < Math.ceil(totalItems / pageSize),
          hasPreviousPage: page > 1,
        },
      };
    }

    if (userRole === 'lawyer') {
      const lawyerExists = await this.prisma.lawyer.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyerExists) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const where = { lawyer_id: userId };

      const [items, totalItems] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where,
          select,
          skip,
          take: pageSize,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      if (totalItems === 0) {
        throw new NotFoundException('Nenhuma notificação encontrada');
      }

      return {
        data: items,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: page < Math.ceil(totalItems / pageSize),
          hasPreviousPage: page > 1,
        },
      };
    }

    throw new ForbiddenException(
      'Role não autorizada para acessar notificações',
    );
  }
}
