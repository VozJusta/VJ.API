import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { PdfService } from "../services/pdf.service";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";

@Controller('pdf')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuard)
export class GeneratePdfController {
    constructor(private readonly pdfService: PdfService) { }

    @Get(':id')
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