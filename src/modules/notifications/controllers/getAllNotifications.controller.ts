import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReadAllNotifications } from '@m/notifications/service/listNotifications.service';
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { PaginationNotificationsDTO } from '@m/notifications/dto/pagination-notifications.dto';

@Controller('notifications')
export class GetAllNotifications {
  constructor(private readonly readAllNotifications: ReadAllNotifications) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  async getAllNotifications(
    @Req() req: RequestUser,
    @Query() pagination: PaginationNotificationsDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.readAllNotifications.readAll(userId, role, pagination);
  }
}
