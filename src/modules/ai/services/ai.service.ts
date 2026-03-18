import { Injectable } from "@nestjs/common";
import { RagService } from "./rag.service";
import { LlmService } from "./llm.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";

@Injectable()
export class AiService {
    constructor(
        private ragService: RagService,
        private llmService: LlmService,
        private prisma: PrismaService
    ) { }

    async analyzeReport(reportId: string) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId }
        })

        const context = await this.ragService.retrieve(report?.transcription || 'Ola')

        const response = await this.llmService.generate({
            input: report?.transcription || 'Ola',
            context
        })

        await this.prisma.aiResponse.create({
            data: {
                report_id: reportId,
                model: 'mixtral',
                provider: 'groq',
                prompt: response.prompt,
                response: JSON.stringify(response.output),
            },
        });

        await this.prisma.report.update({
            where: { id: reportId },
            data: {
                legal_analysis: response.output.analysis,
                simplified_explanation: response.output.explanation,
                confidence_score: response.output.confidence,
            }
        })

        return response.output
    }
}