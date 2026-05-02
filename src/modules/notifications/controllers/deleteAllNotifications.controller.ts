import { Controller, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { DeleteAllNotificationsService } from '@m/notifications/service/deleteAllNotifications.service';
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
export class DeleteAllNotificationsController {
  constructor(
    private readonly deleteAll: DeleteAllNotificationsService,
  ) {}

  @Delete('')
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Remove todas as notificações do usuário',
    description:
      'Exclui todas as notificações vinculadas ao usuário autenticado, retornando a quantidade removida.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT no formato Bearer <token>.',
  })
  @ApiResponse({
    status: 200,
    description: 'Remoção de notificações concluída com sucesso.',
    schema: {
      example: {
        ok: true,
        deleted: 4,
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
      'Cidadão ou advogado não encontrado, ou o usuário não possui notificações para remover.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Nenhuma notificação encontrada para remover',
        error: 'Not Found',
      },
    },
  })
  async deleteAllNotifications(@Req() req: RequestUser) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.deleteAll.deleteAll(userId, role);
  }
}
