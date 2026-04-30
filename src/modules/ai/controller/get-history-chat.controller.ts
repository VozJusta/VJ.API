import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { GetHistoryChatService } from "../services/get-history-chat.service";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthTokenGuardAccess } from "@modules/auth/guard/access-token.guard";

@Controller('chat')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuardAccess)
export class GetHistoryChatController {
    constructor(private readonly getHistory: GetHistoryChatService) { }

    @Get(':id')
    @ApiOperation({ summary: 'Busca o histórico de mensagens de uma conversa' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID da conversa' })
    @ApiResponse({
        status: 200,
        description: 'Histórico retornado com sucesso.',
        schema: {
            example: {
                messages: [
                    { id: 'msg1', role: 'User', content: 'Meu caso é...', created_at: '2026-04-15T12:00:00.000Z' },
                    { id: 'msg2', role: 'Assistant', content: 'Pode me informar mais detalhes?', created_at: '2026-04-15T12:00:10.000Z' }
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    @ApiResponse({ status: 404, description: 'Conversa não encontrada.' })
    async getHistoryChat(@Param('id') id: string) {
        return await this.getHistory.getHistoryChat(id)
    }
}