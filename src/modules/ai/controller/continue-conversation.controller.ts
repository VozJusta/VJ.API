import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";
import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";
import { ContinueConversationService } from "../services/continue-conversation.service";
import { RequestUser } from "@modules/common/interfaces/interfaces";

@Controller('conversation')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuard)
export class ContinueConversationController {
    constructor(private readonly continueConversation: ContinueConversationService) {}

    @Post('continue')
    @ApiOperation({ summary: 'Continua a conversa e pode finalizar com geração do relatório' })
    @ApiBody({
        type: ContinueConversationDto,
        examples: {
            default: {
                summary: 'Mensagem de continuidade',
                value: {
                    conversationId: 'clx123conversation',
                    message: 'Sim, tenho os comprovantes e protocolo de atendimento.'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Retorna nova pergunta da IA ou relatório finalizado.',
        schema: {
            oneOf: [
                {
                    example: {
                        conversationId: 'clx123conversation',
                        caseId: 'clx123case',
                        question: 'Qual foi a data da cobrança indevida?',
                        finished: false
                    }
                },
                {
                    example: {
                        finished: true,
                        caseId: 'clx123case',
                        conversationId: 'clx123conversation',
                        reportId: 'clx123report',
                        input: 'Usuário: ...',
                        area: 'Civil',
                        legal_analysis: '...',
                        simplified_explanation: '...',
                        next_steps: ['...'],
                        confidence: 0.9
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 400, description: 'Conversa já encerrada ou payload inválido.' })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    @ApiResponse({ status: 404, description: 'Conversa não encontrada.' })
    async continue(@Body() body: ContinueConversationDto, @Req() req: RequestUser) {
        return await this.continueConversation.continueConversation(body, req.user.sub)
    }
}