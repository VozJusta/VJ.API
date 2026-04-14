import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardLawyerService } from '@m/dashboard/service/dashboard-lawyer.service';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardLawyerController {
  constructor(private readonly dashboardService: DashboardLawyerService) {}

  @Get('/lawyer/analytics')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna analytics de solicitações aceitas do advogado',
    description:
      'Busca os dados agregados por dia para exibição em gráfico no dashboard do advogado autenticado.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados de analytics para o dashboard do advogado.',
    schema: {
      example: {
        data: [
          { date: '2026-04-08', value: 2 },
          { date: '2026-04-07', value: 4 },
          { date: '2026-04-06', value: 1 },
        ],
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
  async getReportsAcceptedLawyer(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.acceptedRequestAnalytics(userId, role);
  }

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

  @Get('/lawyer/high-relevance')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna relatórios com maior relevância para o advogado',
    description:
      'Busca os relatórios do advogado autenticado ordenados por confidence_score em ordem decrescente.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna a lista de relatórios com maior relevância.',
    schema: {
      example: [
        {
          id: 'cly4v7sdm0000q8x2ptv0h9k1',
          confidence_score: 0.97,
          category_detected: 'Direito do Consumidor',
        },
        {
          id: 'cly4v8a6k0001q8x2zr2j3j8l',
          confidence_score: 0.91,
          category_detected: 'Direito Trabalhista',
        },
      ],
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
  async getHighRelevance(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.highRelevance(userId, role);
  }
}
