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
import { RejectCaseRequest } from '@m/lawyer/service/rejectCaseRequest.service';

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
export class RejectCaseRequestController {
  constructor(private readonly rejectCaseRequestService: RejectCaseRequest) {}

  @Put('requests/:id/reject')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Recusa uma solicitação de caso do advogado autenticado',
    description: 'Atualiza o status da solicitação para Refused.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID da solicitação de caso',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitação de caso recusada com sucesso.',
    schema: {
      example: {
        message: 'Solicitação de caso recusada com sucesso',
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
    description: 'Advogado ou solicitação não encontrado.',
  })
  async rejectCaseRequest(
    @Param('id') caseRequestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.rejectCaseRequestService.rejectCaseRequest(
      userId,
      role,
      caseRequestId,
    );
  }
}
