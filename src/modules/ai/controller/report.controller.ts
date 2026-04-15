import { BadRequestException, Body, Controller, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ReportService } from "../services/report.service";
import { PdfService } from "../services/pdf.service";
import { Request, Response } from "express";
import { AuthTokenGuard } from "src/modules/auth/guard/access-token.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";
import { TranscribeAudioDTO } from "../dto/transcribe-audio.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface RequestUser extends Request {
    user: {
        sub: string,
        role: string
    }
}

@Controller('report')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuard)
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
        private pdfService: PdfService,
    ) { }

    @Post('conversation/start')
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
        return await this.reportService.startConversation(firstMessage, req.user.sub)
    }

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

    @Get('chat/:id')
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
    async getHistory(@Param('id') id: string) {
        return await this.reportService.getHistoryChat(id)
    }

    @Put('accept/:id')
    @ApiOperation({ summary: 'Aceita um caso pendente vinculando-o ao advogado (Acesso restrito)' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID único do caso' })
    @ApiResponse({
        status: 200,
        description: 'Caso aceito com sucesso e vinculado ao advogado.',
        schema: { example: { message: 'Relatório aceito com sucesso' } }
    })
    @ApiResponse({
        status: 401,
        description: 'Usuário não autorizado. Ocorre caso o token seja inválido ou o usuário seja um Cidadão (Citizen).',
        schema: { example: { message: 'Usuário não autorizado', error: 'Unauthorized', statusCode: 401 } }
    })
    @ApiResponse({
        status: 404,
        description: 'Caso não encontrado no sistema.',
        schema: { example: { message: 'Caso não encontrado', error: 'Not Found', statusCode: 404 } }
    })
    async acceptCase(@Param('id') id: string, @Req() req: RequestUser) {
        return await this.reportService.acceptCase(id, req.user.sub, req.user.role)
    }

    @Put('reject/:id')
    @ApiOperation({ summary: 'Recusa um caso pendente (Acesso restrito)' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID único do caso' })
    @ApiResponse({
        status: 200,
        description: 'Caso recusado com sucesso.',
        schema: { example: { message: 'Relatório recusado' } }
    })
    @ApiResponse({
        status: 401,
        description: 'Usuário não autorizado. Ocorre caso o token seja inválido ou o usuário seja um Cidadão (Citizen).',
        schema: { example: { message: 'Usuário não autorizado', error: 'Unauthorized', statusCode: 401 } }
    })
    @ApiResponse({
        status: 404,
        description: 'Caso não encontrado no sistema.',
        schema: { example: { message: 'Caso não encontrado', error: 'Not Found', statusCode: 404 } }
    })
    async rejectCase(@Param('id') id: string, @Req() req: RequestUser) {
        return await this.reportService.rejectCase(id, req.user.role)
    }

    @Get('/pdf/:id')
    @ApiOperation({ summary: 'Gera e faz o download de um relatório em formato PDF' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID único do relatório gerado anteriormente' })
    @ApiResponse({
        status: 200,
        description: 'Arquivo PDF gerado com sucesso.',
        content: { 'application/pdf': {} }
    })
    @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    async generatePdf(@Param('id') id: string, @Res() res: Response) {
        return this.pdfService.generateReportPdf(id, res)
    }

    @Post('transcribe')
    @ApiOperation({ summary: 'Transcreve um arquivo de áudio para texto' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo de áudio (máximo de 25MB)'
                }
            },
            required: ['file']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Áudio transcrito com sucesso.',
        schema: {
            example: {
                transcription: 'Texto transcrito do áudio enviado.'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Arquivo inválido, ausente ou não é áudio.' })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    @ApiResponse({ status: 500, description: 'Erro interno ao transcrever o áudio.' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.includes('audio')) {
                    return cb(new BadRequestException('Apenas arquivos de áudio são permitidos'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 25 * 1024 * 1024 }, 
        }),
    )
    async transcribeAudio(@UploadedFile() file: TranscribeAudioDTO) {
        const transcription = await this.reportService.transcribeAudio(file);
        return { transcription };
    }
}