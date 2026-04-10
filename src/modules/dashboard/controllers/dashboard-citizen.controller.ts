import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardCitizenService } from '../service/dashboard-citizen.service';
import { AuthTokenGuard } from 'src/modules/auth/guard/access-token.guard';
import { Request } from 'express';
import { PaginationReportsDTO } from '../dto/pagination-reports.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardCitizenController {
  constructor(private readonly dashboardService: DashboardCitizenService) {}

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
            created_at: '2026-04-07 18:08:09.824',
          },
        },
        message: 'Informações de usuário retornadas com sucesso',
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

  @Get('/citizens/me/reports/:reportId')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna um relatório do cidadão autenticado por id',
    description:
      'Busca um único relatório pelo id, garantindo que pertença ao usuário autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiParam({
    name: 'reportId',
    required: true,
    description: 'Id do relatório a ser consultado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna um único relatório do cidadão autenticado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cidadão ou relatório não encontrado.',
  })
  async getCitizenReport(
    @Req() req: AuthenticatedRequest,
    @Param('reportId') reportId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.findCitizenReportById(userId, role, reportId);
  }
}
