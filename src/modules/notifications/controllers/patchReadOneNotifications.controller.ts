import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ReadOneNotificationsService } from '@m/notifications/service/readOneNotifications.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class PatchReadOneNotificationsController {
  constructor(private readonly readOneNotifications: ReadOneNotificationsService) {}

  @Patch(':notificationId/read')
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Marca uma notificação como lida',
    description:
      'Marca como lida apenas a notificação informada, desde que pertença ao usuário autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT no formato Bearer <token>.',
  })
  @ApiParam({
    name: 'notificationId',
    required: true,
    description: 'ID da notificação a ser marcada como lida.',
    example: '5d6f2e2a-dc0a-4f5b-b797-ec9fe6f2b9b8',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificação marcada como lida com sucesso.',
    schema: {
      example: {
        ok: true,
        updated: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'notificationId ausente ou notificação já marcada como lida.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Notificação já está lida',
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
  @ApiResponse({
    status: 403,
    description: 'Role não autorizada para acessar notificações.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Role não autorizada para acessar notificações',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notificação não encontrada para o usuário autenticado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notificação não encontrada',
        error: 'Not Found',
      },
    },
  })
  async patchReadOneNotification(
    @Req() req: RequestUser,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.readOneNotifications.markAsRead(userId, role, notificationId);
  }
}
