import {
  Controller,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { Request } from 'express';
import { AcceptCaseRequest } from '@m/lawyer/service/acceptCaseRequest.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
@ApiTags('Lawyer')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT recebido no login no formato "Bearer <token>"',
  required: true,
})
export class AcceptCaseRequestController {
  constructor(private readonly acceptCaseRequestService: AcceptCaseRequest) {}

  @Put('requests/:id/accept')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Aceita uma solicitação de caso do advogado autenticado',
    description:
      'Atualiza a solicitação para Accepted e vincula o advogado ao caso e ao relatório correspondente.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID da solicitação de caso',
  })
  @ApiResponse({
    status: 200,
    description: 'Caso aceito com sucesso.',
    schema: {
      example: {
        message: 'Caso aceito com sucesso',
        caseId: 'clx123case',
        caseRequestId: 'clx123caserequest',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Role inválida ou solicitação já respondida.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Advogado, solicitação ou relatório não encontrado.',
  })
  async acceptCaseRequest(
    @Param('id') caseRequestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.acceptCaseRequestService.acceptCaseRequest(
      userId,
      role,
      caseRequestId,
    );
  }
}
