import { Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { ReadAllNotificationsService } from '@m/notifications/service/readAllNotifications.service';

@Controller('notifications')
export class PatchReadAllNotificationsController {
  constructor(private readonly readAllNotifications: ReadAllNotificationsService) {}

  @Patch('read-all')
  @UseGuards(AuthTokenGuardAccess)
  async patchReadAllNotifications(@Req() req: RequestUser) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.readAllNotifications.markAllAsRead(userId, role);
  }
}
