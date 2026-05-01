import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { DeleteAllNotificationsService } from '../service/deleteAllNotifications.service';

@Controller('notifications')
export class DeleteAllNotificationsController {
  constructor(
    private readonly deleteAll: DeleteAllNotificationsService,
  ) {}

  @Delete('')
  @UseGuards(AuthTokenGuard)
  async deleteAllNotifications(@Req() req: RequestUser) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.deleteAll.deleteAll(userId, role);
  }
}
