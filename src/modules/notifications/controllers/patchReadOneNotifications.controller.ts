import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ReadOneNotificationsService } from '../service/readOneNotifications.service';
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('notifications')
export class PatchReadOneNotificationsController {
  constructor(private readonly readOneNotifications: ReadOneNotificationsService) {}

  @Patch(':notificationId/read')
  @UseGuards(AuthTokenGuard)
  async patchReadOneNotification(
    @Req() req: RequestUser,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.readOneNotifications.markAsRead(userId, role, notificationId);
  }
}
