import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";
import { PaginationReportsDTO } from "@modules/dashboard/dto/pagination-reports.dto";
import { DashboardCitizenService } from "@modules/dashboard/service/dashboard-citizen.service";
import { Get, UseGuards, Req, Controller, Query } from "@nestjs/common";
import { ApiOperation, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}
@ApiTags('Dashboard')
@Controller()
export class GetAllReportCitizenController {
  constructor(private readonly dashboardService: DashboardCitizenService) { }
  @Get('/citizens/me/reports')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna o dashboard do usuário autenticado',
    description: 'Busca os dados do perfil presente no token JWT.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description:
      'Número da página para paginação dos relatórios (2 por página).',
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description:
      'Quantidade de relatórios por página. O valor está sujeito ao limite máximo definido pelo backend.',
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados do usuário autenticado.',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          example: 'Citizen',
        },
        user: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '91b84236-6d06-4792-8366-1ba35a3b8676',
                  },
                  category_detected: {
                    type: 'string',
                    example: 'Labor_and_employment',
                  },
                  status: {
                    type: 'string',
                    example: 'Pending',
                  },
                  created_at: {
                    type: 'string',
                    example: '2026-04-07 18:08:09.824',
                  },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            perPage: {
              type: 'integer',
              example: 2,
            },
            total: {
              type: 'integer',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
          },
        },
      },
      example: {
        role: 'Citizen',
        user: {
          data: [
            {
              id: '91b84236-6d06-4792-8366-1ba35a3b8676',
              category_detected: 'Labor_and_employment',
              status: 'Pending',
              created_at: '2026-04-07 18:08:09.824',
            },
            {
              id: '3ad8f318-c730-4e1a-b4d7-545f1a6d55c2',
              category_detected: 'Health',
              status: 'Resolved',
              created_at: '2026-04-06 14:22:31.102',
            },
          ],
        },
        pagination: {
          page: 1,
          perPage: 2,
          total: 10,
          totalPages: 5,
        },
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
    description: 'Perfil não encontrado para a role informada.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cidadão não encontrado',
        error: 'Not Found',
      },
    },
  })
  async getReportsByCitizen(
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationReportsDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.listReportsByCitizen(userId, role, pagination);
  }

}