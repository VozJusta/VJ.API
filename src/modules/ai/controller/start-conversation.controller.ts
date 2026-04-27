import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { RequestUser } from "@modules/common/interfaces/interfaces";
import { StartConversationService } from "../services/start-conversation.service";

@Controller('conversation')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuard)
export class StartConversationController {

    constructor(private readonly startConversation: StartConversationService) {}

    @Post('start')
    @ApiOperation({ summary: 'Inicia a conversa para coleta de dados do caso jurídico' })
    @ApiBody({
        description: 'Primeira mensagem do usuário descrevendo o caso',
        type: StartConversationDTO,
        examples: {
            default: {
                summary: 'Mensagem inicial',
                value: {
                    message: 'O cliente sofreu uma cobrança indevida no cartão de crédito e não conseguiu estorno no banco.'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Conversa iniciada com sucesso.',
        schema: {
            example: {
                conversationId: 'clx123conversation',
                caseId: 'clx123case',
                question: 'Entendi. Você possui comprovantes da cobrança e registros de contato com o banco?',
                finished: false
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    async create(@Body() firstMessage: StartConversationDTO, @Req() req: RequestUser) {
        return await this.startConversation.startConversation(firstMessage, req.user.sub)
    }
}