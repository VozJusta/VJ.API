import { ContinueConversationDto } from "@modules/ai/dto/continue-conversation.dto";
import { RequestUser } from "@modules/auth/interfaces/interfaces";
import { Post, Body, Req } from "@nestjs/common";
import { ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";

export class ContinueConversationController {
    constructor(private reportService: ContinueConversationDto) { }
    @Post('conversation/continue')
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
    async continueConversation(@Body() body: ContinueConversationDto, @Req() req: RequestUser) {
        return await this.reportService.continueConversation(body, req.user.sub)
    }

}