import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GeneratePdfService } from "../services/generate-pdf.service";
import { Response } from "express";
import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";

@ApiTags("Simulation")
@UseGuards(AuthTokenGuard)
@Controller()
export class GeneratePdfController {
    constructor(private readonly generateService: GeneratePdfService) {}

    @Get('pdf/:id')
    @ApiOperation({ summary: 'Gera e faz o download do relatório de simulação em PDF' })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'ID do relatório de simulação',
    })
    @ApiResponse({
        status: 200,
        description: 'Arquivo PDF gerado com sucesso.',
        content: { 'application/pdf': {} },
    })
    @ApiResponse({
        status: 404,
        description: 'Relatório de simulação não encontrado.',
    })
    async generate(@Param('id') id: string,@Res() res: Response) {
        return await this.generateService.generateSimulationReportPdf(id, res)
    }
}