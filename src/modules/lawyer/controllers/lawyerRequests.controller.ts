import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { LawyerRequestsStatusService } from '@m/lawyer/service/lawyerRequestsStatus.service';
import { RequestsStatusDTO } from '@m/lawyer/dto/requests-status.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Status } from 'generated/prisma/enums';
import { RequestUser } from '@modules/common/interfaces/interfaces';

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
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitações retornada com sucesso.',
    schema: {
      example: [
        {
          id: 'clx123caserequest',
          clientName: 'João da Silva',
          category_detected: 'Civil',
          statusCase: 'Pending',
          created_at: '2026-04-22',
        },
      ],
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
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.lawyerRequestStatus.requestsByStatus(userId, role, status);
  }
}
