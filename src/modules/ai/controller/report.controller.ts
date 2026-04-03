import { Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AiService } from "../services/ai.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { PdfService } from "../services/pdf.service";
import { nextTick } from "process";
import { Request, Response } from "express";
import { AuthTokenGuard } from "src/modules/auth/guard/access-token.guard";
import { ApiHeader } from "@nestjs/swagger";

interface RequestUser extends Request {
    user: {
        sub: string
    }
}

@Controller('report')
@UseGuards(AuthTokenGuard)
export class ReportController {
    constructor(
        private readonly aiService: AiService,
        private pdfService: PdfService,
    ) { }

    @Post()
    @ApiHeader({
        name: 'Authorization',
        description: 'Token para acessar rota no formato Bearer <token>',
        required: true,
    })
    async create(@Body('text') text: string, @Req() req: RequestUser) {
        return await this.aiService.createReport(text, req.user.sub)
    }

    @Get('/pdf/:id')
    async generatePdf(@Param('id') id: string, @Res() res: Response) {
        return this.pdfService.generateReportPdf(id, res)
    }
}