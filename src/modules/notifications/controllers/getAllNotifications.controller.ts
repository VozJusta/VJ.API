import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ListAllNotificationsService } from '@m/notifications/service/listNotifications.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { PaginationNotificationsDTO } from '@m/notifications/dto/pagination-notifications.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class GetAllNotificationsController {
  constructor(private readonly listAllNotifications: ListAllNotificationsService) {}

  @Get()
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Lista notificações do usuário autenticado',
    description:
      'Retorna notificações paginadas do cidadão ou advogado autenticado, ordenadas por data de criação (mais recente primeiro).',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT no formato Bearer <token>.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Página atual da listagem.',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade de notificações por página.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificações retornadas com sucesso.',
    schema: {
      example: {
        items: [
          {
            id: '5d6f2e2a-dc0a-4f5b-b797-ec9fe6f2b9b8',
            title: 'Atualização do caso',
            body: 'Seu caso recebeu uma nova movimentação.',
            type: 'CASE_UPDATED',
            is_read: false,
            created_at: '2026-05-01T12:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
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
    description: 'Usuário não encontrado ou sem notificações.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Nenhuma notificação encontrada',
        error: 'Not Found',
      },
    },
  })
  async getAllNotifications(
    @Req() req: RequestUser,
    @Query() pagination: PaginationNotificationsDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.listAllNotifications.listAll(userId, role, pagination);
  }
}
