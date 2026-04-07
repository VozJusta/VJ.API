import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../../dashboard/service/dashboard.service';
import { AuthTokenGuard } from 'src/modules/auth/guard/access-token.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/citizens/me/reports')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna o dashboard do usuário autenticado',
    description:
      'Busca os dados do perfil presente no token JWT.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página para paginação dos relatórios (2 por página).',
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados do usuário autenticado .',
    schema: {
      example: {
        role: 'Citizen',
        user: {
          report: {
            id: '91b84236-6d06-4792-8366-1ba35a3b8676',
            category_detected: 'Labor_and_employment',
            status: 'Pending',
            created_at: '2026-04-07 18:08:09.824'
          },
          
        },
        message: 'Informações de usuário retornadas com sucesso'
      }
    }
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
      }
    }
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
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    const parsedPage = page ? Number(page) : 1;

    return this.dashboardService.getCitizenReports(userId, role, parsedPage);
  }
}
