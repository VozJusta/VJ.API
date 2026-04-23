import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@m/common/interfaces/interfaces';
import { FindCitizenReportByIdService } from '@modules/dashboard/service/citizen/findCitizenReportById.service';
import { Get, UseGuards, Req, Param, Controller } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';



@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class GetOneReportsCitizenController {
  constructor(
    private readonly dashboardService: FindCitizenReportByIdService,
  ) {}
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
            report: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '91b84236-6d06-4792-8366-1ba35a3b8676',
                },
                transcription: {
                  type: 'string',
                  example:
                    'No dia 10 de abril, meu empregador informou que não pagaria as horas extras acumuladas.',
                },
                simplified_explanation: {
                  type: 'string',
                  example:
                    'O relato aponta possível descumprimento de direitos trabalhistas relacionados a horas extras.',
                },
                legal_analysis: {
                  type: 'string',
                  example:
                    'Há indícios de violação da CLT quanto ao pagamento de horas extras e adicional legal.',
                },
                category_detected: {
                  type: 'string',
                  example: 'Labor_and_employment',
                },
                status: {
                  type: 'string',
                  example: 'Pending',
                },
                evidence: {
                  type: 'array',
                  items: {
                    type: 'string',
                    example:
                      'https://storage.example.com/evidences/holerite-abril.pdf',
                  },
                },
                lawyer: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    full_name: {
                      type: 'string',
                      example: 'Maria Oliveira',
                    },
                    bio: {
                      type: 'string',
                      example:
                        'Advogada trabalhista com 8 anos de atuação em litígios e acordos extrajudiciais.',
                    },
                    phone: {
                      type: 'string',
                      example: '+55 11 98888-7777',
                    },
                    email: {
                      type: 'string',
                      example: 'maria.oliveira@adv.com',
                    },
                  },
                },
              },
            },
          },
        },
      },
      example: {
        role: 'Citizen',
        user: {
          report: {
            id: '91b84236-6d06-4792-8366-1ba35a3b8676',
            transcription:
              'No dia 10 de abril, meu empregador informou que não pagaria as horas extras acumuladas.',
            simplified_explanation:
              'O relato aponta possível descumprimento de direitos trabalhistas relacionados a horas extras.',
            legal_analysis:
              'Há indícios de violação da CLT quanto ao pagamento de horas extras e adicional legal.',
            category_detected: 'Labor_and_employment',
            status: 'Pending',
            evidence: [
              'https://storage.example.com/evidences/holerite-abril.pdf',
              'https://storage.example.com/evidences/conversa-whatsapp.png',
            ],
            lawyer: {
              full_name: 'Maria Oliveira',
              bio: 'Advogada trabalhista com 8 anos de atuação em litígios e acordos extrajudiciais.',
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
    description: 'Cidadão ou relatório não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Relatório não encontrado',
        error: 'Not Found',
      },
    },
  })
  async getCitizenReport(
    @Req() req: RequestUser,
    @Param('reportId') reportId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.dashboardService.findCitizenReportById(userId, role, reportId);
  }
}
