import {
  Controller,
  Param,
  Put,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from 'src/modules/auth/guard/access-token.guard';
import { CaseRequestService } from '../service/case-request.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
@ApiTags('Case Requests')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token de acesso no formato: Bearer <token>',
  required: true,
})
@UseGuards(AuthTokenGuard)
export class CaseRequestController {
  constructor(private readonly caseRequestService: CaseRequestService) {}

  @Put('requests/:id/accept')
  @ApiOperation({ summary: 'Aceita uma solicitação de caso (Acesso restrito a advogados)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID único da solicitação de caso' })
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
    description: 'Solicitação já foi respondida ou caso já foi aceito.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitação de caso não encontrada.',
  })
  async acceptCaseRequest(
    @Param('id') caseRequestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.caseRequestService.acceptCaseRequest(
      caseRequestId,
      req.user.sub,
    );
  }
}