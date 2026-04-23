import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindCaseById } from '@m/lawyer/service/findCaseById.service';
import { RequestUser } from '@m/common/interfaces/interfaces';

@Controller('lawyer')
@ApiTags('Lawyer')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT recebido no login no formato "Bearer <token>"',
  required: true,
})
export class GetCaseByIdController {
  constructor(private readonly findCaseById: FindCaseById) {}

  @Get('/cases/:caseId')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary:
      'Retorna os dados resumidos do relatório do caso para o advogado autenticado',
    description:
      'Busca o caso por id e retorna o relatório mais recente com evidências e dados do cidadão.',
  })
  @ApiParam({
    name: 'caseId',
    required: true,
    type: 'string',
    description: 'ID do caso',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do relatório do caso retornados com sucesso.',
    schema: {
      example: {
        role: 'Lawyer',
        user: {
          report: {
            id: 'clx123report',
            title: 'Cobrança indevida',
            transcription: 'Texto transcrito do atendimento',
            simplified_explanation: 'Resumo simples para o cidadão',
            legal_analysis: 'Análise jurídica detalhada do caso',
            category_detected: 'Labor_and_employment',
            status: 'Pending',
            evidence: [
              'https://storage.example.com/evidences/holerite-abril.pdf',
              'https://storage.example.com/evidences/conversa-whatsapp.png',
            ],
            citizen: {
              full_name: 'Maria Oliveira',
              phone: '+55 11 98888-7777',
              email: 'maria.oliveira@adv.com',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Role inválida.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Advogado ou caso não encontrado.',
  })
  async getCaseById(@Req() req: RequestUser, @Param('caseId') caseId: string) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.findCaseById.findCase(userId, role, caseId);
  }
}
