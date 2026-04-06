import { Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AiService } from "../services/ai.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { PdfService } from "../services/pdf.service";
import { nextTick } from "process";
import { Request, Response } from "express";
import { AuthTokenGuard } from "src/modules/auth/guard/access-token.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReportResponseDto } from "../dto/report-response.dto";

interface RequestUser extends Request {
    user: {
        sub: string
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
        private readonly aiService: AiService,
        private pdfService: PdfService,
    ) { }

    @Post()
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
    async create(@Body('text') text: string, @Req() req: RequestUser) {
        return await this.aiService.createReport(text, req.user.sub)
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