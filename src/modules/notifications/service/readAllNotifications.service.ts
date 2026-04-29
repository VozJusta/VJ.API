import { PrismaService } from '@modules/prisma/service/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PaginationNotificationsDTO } from '../dto/pagination-notifications.dto';

@Injectable()
export class ReadAllNotifications {
  constructor(private readonly prisma: PrismaService) {}

  async readAll(userId: string, role: string, pagination: PaginationNotificationsDTO) {
    const userRole = role.toLowerCase();

    if (userRole === 'citizen') {
      const notifications = await this.prisma.notification.findMany({
        where: { citizen_id: userId },
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          is_read: true,
        },
      });

      return notifications;
    } 
    
    if(userRole === 'lawyer'){
      const notifications = await this.prisma.notification.findMany({
        where: { lawyer_id: userId },
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          is_read: true,
        },
      });

      return notifications;
    }

    throw new ForbiddenException('Role não autorizada para acessar notificações')
  }
}
