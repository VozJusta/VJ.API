import { Body, Controller, Get, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { ReportService } from "../services/report.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { PdfService } from "../services/pdf.service";
import { nextTick } from "process";
import { Request, Response } from "express";
import { AuthTokenGuard } from "src/modules/auth/guard/access-token.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReportResponseDto } from "../dto/report-response.dto";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";

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
    @ApiOperation({ summary: 'Cria um novo relatório jurídico usando IA a partir de um texto' })
    @ApiBody({ 
        schema: { 
            type: 'object', 
            properties: { text: { type: 'string', example: 'O cliente sofreu uma cobrança indevida no cartão...' } } 
        },
        description: 'Texto relatando o caso para análise da IA'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Relatório criado com sucesso.',
        type: ReportResponseDto 
    })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    async create(@Body() firstMessage: StartConversationDTO, @Req() req: RequestUser) {
        return await this.reportService.startConversation(firstMessage, req.user.sub)
    }

    @Post('conversation/continue')
    async continueConversation(@Body() body: ContinueConversationDto, @Req() req: RequestUser) {
        return await this.reportService.continueConversation(body, req.user.sub)
    }

    @Get('chat/:id')
    async getHistory(@Param('id') id: string) {
        return await this.reportService.getHistoryChat(id)
    }

    @Put('accept/:id')
    @ApiOperation({ summary: 'Aceita um relatório pendente vinculando-o ao advogado (Acesso restrito)' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID único do relatório gerado' })
    @ApiResponse({ 
        status: 200, 
        description: 'Relatório aceito com sucesso e vinculado ao advogado.',
        schema: { example: { message: 'Relatório aceito com sucesso' } }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Usuário não autorizado. Ocorre caso o token seja inválido ou o usuário seja um Cidadão (Citizen).',
        schema: { example: { message: 'Usuário não autorizado', error: 'Unauthorized', statusCode: 401 } }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Relatório não encontrado no sistema.',
        schema: { example: { message: 'Relatório não encontrado', error: 'Not Found', statusCode: 404 } }
    })
    async acceptReport(@Param('id') id: string, @Req() req: RequestUser) {
        return await this.reportService.acceptCase(id, req.user.sub, req.user.role)
    }

    @Put('reject/:id')
    @ApiOperation({ summary: 'Recusa um relatório pendente (Acesso restrito)' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID único do relatório gerado' })
    @ApiResponse({ 
        status: 200, 
        description: 'Relatório recusado com sucesso.',
        schema: { example: { message: 'Relatório recusado' } }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Usuário não autorizado. Ocorre caso o token seja inválido ou o usuário seja um Cidadão (Citizen).',
        schema: { example: { message: 'Usuário não autorizado', error: 'Unauthorized', statusCode: 401 } }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Relatório não encontrado no sistema.',
        schema: { example: { message: 'Relatório não encontrado', error: 'Not Found', statusCode: 404 } }
    })
    async rejectReport(@Param('id') id: string, @Req() req: RequestUser) {
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
}