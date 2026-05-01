import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ListAllNotificationsService } from '@m/notifications/service/listNotifications.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { PaginationNotificationsDTO } from '@m/notifications/dto/pagination-notifications.dto';

@Controller('notifications')
export class GetAllNotificationsController {
  constructor(private readonly listAllNotifications: ListAllNotificationsService) {}

  @Get()
  @UseGuards(AuthTokenGuardAccess)
  async getAllNotifications(
    @Req() req: RequestUser,
    @Query() pagination: PaginationNotificationsDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.listAllNotifications.listAll(userId, role, pagination);
  }
}
