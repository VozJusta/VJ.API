import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { DeleteNotificationsByIdService } from '@m/notifications/service/deleteOneNotifications.service';
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
export class DeleteNotificationsByIdController {
  constructor(private readonly deleteNotifications: DeleteNotificationsByIdService) {}

  @Delete(':notificationId')
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Remove uma notificação por ID',
    description:
      'Exclui apenas a notificação informada, desde que ela pertença ao usuário autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT no formato Bearer <token>.',
  })
  @ApiParam({
    name: 'notificationId',
    required: true,
    description: 'ID da notificação a ser removida.',
    example: '5d6f2e2a-dc0a-4f5b-b797-ec9fe6f2b9b8',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificação removida com sucesso.',
    schema: {
      example: {
        ok: true,
        deleted: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros obrigatórios ausentes na solicitação.',
    schema: {
      example: {
        statusCode: 400,
        message: 'notificationId é obrigatório',
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
    description: 'Role não autorizada para excluir notificações.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Role não autorizada para excluir notificações',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Cidadão ou advogado não encontrado, ou a notificação não pertence ao usuário autenticado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Notificação não encontrada',
        error: 'Not Found',
      },
    },
  })
  async deleteNotification(
    @Req() req: RequestUser,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.deleteNotifications.deleteOne(userId, role, notificationId);
  }
}
