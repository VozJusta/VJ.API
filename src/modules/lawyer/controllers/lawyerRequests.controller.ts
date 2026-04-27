import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { LawyerRequestsStatusService } from '@m/lawyer/service/lawyerRequestsStatus.service';
import { RequestsStatusDTO } from '@m/lawyer/dto/requests-status.dto';
import { PaginationLawyersDTO } from '@m/citizen/dto/pagination-lawyers.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Status } from 'generated/prisma/enums';
import { RequestUser } from '@m/common/interfaces/interfaces';

@Controller('lawyer')
@ApiTags('Lawyer')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT recebido no login no formato "Bearer <token>"',
  required: true,
})
export class LawyerRequestController {
  constructor(private readonly lawyerRequestStatus: LawyerRequestsStatusService) {}

  @Get('/requests')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Lista solicitações do advogado autenticado com filtro opcional',
    description:
      'Retorna as solicitações de caso do advogado autenticado. O filtro por status é opcional.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Status,
    description: 'Status da solicitação para filtrar resultados',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página da listagem paginada.',
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de solicitações por página.',
    schema: { type: 'integer', minimum: 1, default: 2 },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitações retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx123caserequest' },
              title: {
                type: 'string',
                example: 'Problema trabalhista com empresa',
              },
              clientName: { type: 'string', example: 'João da Silva' },
              category_detected: { type: 'string', example: 'Civil' },
              statusCase: { type: 'string', example: 'Pending' },
              caseId: { type: 'string', example: 'clx123case' },
              reportId: { type: 'string', example: 'clx123report' },
              created_at: { type: 'string', example: '2026-04-22' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 2 },
            totalItems: { type: 'number', example: 12 },
            totalPages: { type: 'number', example: 6 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Status inválido ou role inválida.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Status inválido',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Advogado não encontrado.',
  })
  async getReportsByStatus(
    @Req() req: RequestUser,
    @Query() status?: RequestsStatusDTO,
    @Query() pagination?: PaginationLawyersDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.lawyerRequestStatus.requestsByStatus(
      userId,
      role,
      status,
      pagination,
    );
  }
}
