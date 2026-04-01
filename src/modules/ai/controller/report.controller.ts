import { Body, Controller, Get, NotFoundException, Param, Post, Res } from "@nestjs/common";
import { AiService } from "../services/ai.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { PdfService } from "../services/pdf.service";
import { nextTick } from "process";
import { Response } from "express";

@Controller('report')
export class ReportController {
    constructor(
        private readonly aiService: AiService,
        private prisma: PrismaService,
        private pdfService: PdfService
    ) { }

    @Post()
    async create(@Body('text') text: string, @Body('user_id') userId: string) {
        return await this.aiService.analyzeReport(text, userId)
    }

    @Get('/pdf/:id')
    async generatePdf(@Param('id') id: string, @Res() res: Response) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                ai_versions: true
            }
        });

        if(!report) {
            throw new NotFoundException('Relátorio não encontrado')
        }

        const aiData = report.ai_versions?.[0] ? JSON.parse(report.ai_versions[0].response)
            : {};

        const data = {
            input: report.transcription,
            area: report.category_detected,
            analysis: report.simplified_explanation,
            explanation: report.simplified_explanation,
            next_steps: aiData.next_steps || [],
            confidence: aiData.confidence || 0,
        }

        return this.pdfService.generateReportPdf(data, res)
    }
}