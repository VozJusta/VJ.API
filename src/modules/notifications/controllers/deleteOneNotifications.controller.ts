import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { DeleteNotificationsByIdService } from '@m/notifications/service/deleteOneNotifications.service';

@Controller('notifications')
export class DeleteNotificationsByIdController {
  constructor(private readonly deleteNotifications: DeleteNotificationsByIdService) {}

  @Delete(':notificationId')
  @UseGuards(AuthTokenGuardAccess)
  async deleteNotification(
    @Req() req: RequestUser,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.deleteNotifications.deleteOne(userId, role, notificationId);
  }
}
