import { Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { ReadAllNotificationsService } from '@m/notifications/service/readAllNotifications.service';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class PatchReadAllNotificationsController {
  constructor(private readonly readAllNotifications: ReadAllNotificationsService) {}

  @Patch('read-all')
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Marca todas as notificações como lidas',
    description:
      'Marca como lidas todas as notificações não lidas do usuário autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT no formato Bearer <token>.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificações marcadas como lidas com sucesso.',
    schema: {
      example: {
        ok: true,
        updated: 3,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Todas as notificações já estão lidas.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Todas as notificações já estão lidas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido ou sessão expirada',
        error: 'Unauthorized',
      },
    },
  })
  async patchReadAllNotifications(@Req() req: RequestUser) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.readAllNotifications.markAllAsRead(userId, role);
  }
}
