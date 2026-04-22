import { AuthTokenGuard } from "@m/auth/guard/access-token.guard";
import { OperationalStatusService } from "@modules/dashboard/service/lawyer/operetionalStatus.service";
import { Get, UseGuards, Req, Controller } from "@nestjs/common";
import { ApiOperation, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('Dashboard')
@Controller()
export class GetOperationStatusController {
  constructor(private readonly dashboardService: OperationalStatusService) { }

  @Get('/lawyer/operational-status')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna status operacional das solicitações do advogado',
    description:
      'Busca o total de solicitações pendentes, recusadas e aceitas vinculadas ao advogado autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os totais por status operacional do dashboard do advogado.',
    schema: {
      example: {
        pending: 3,
        refused: 1,
        accepted: 7,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Role inválida no token autenticado.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Role inválida',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token está ausente, inválido ou expirado',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Advogado não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Advogado não encontrado',
        error: 'Not Found',
      },
    },
  })
  async getOperationalStatus(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.operationalStatus(userId, role);
  }

}