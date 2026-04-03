import { Injectable } from "@nestjs/common";
import { RagService } from "./rag.service";
import { LlmService } from "./llm.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { Specialization } from "generated/prisma/enums";

@Injectable()
export class AiService {
    constructor(
        private ragService: RagService,
        private llmService: LlmService,
        private prisma: PrismaService
    ) { }

    async createReport(text: string, userId: string) {
        const classification = await this.llmService.generate({
            input: `Classifique a área jurídica do texto: ${text}`,
            context: []
        });

        const area = parseSpecialization(classification.output?.area)

        const report = await this.prisma.report.create({
            data: {
                transcription: text,
                normalized_text: text,
                legal_analysis: '',
                simplified_explanation: '',
                category_detected: area,
                user_id: userId,
                status: 'Pending'
            }
        })

        let context = await this.ragService.retrieve(text, area)

        context = context.slice(0, 3)

        if (context.length > 0) {
            await this.prisma.ragContext.createMany({
                data: context.map((c) => ({
                    report_id: report.id,
                    source: (c.source as string) || 'qdrant',
                    content: String(c.content),
                    score: Number(c.score)
                }))
            })
        }

        const response = await this.llmService.generate({
            input: text,
            context,
        })

        await this.prisma.aiResponse.create({
            data: {
                report_id: report.id,
                model: 'llama-3.1-8b-instant',
                provider: 'groq',
                prompt: response.prompt,
                response: JSON.stringify(response.output)
            }
        })

        await this.prisma.report.update({
            where: { id: report.id },
            data: {
                legal_analysis: response.output.legal_analysis,
                simplified_explanation: response.output.simplified_explanation,
                category_detected: parseSpecialization(response.output.area),
                status: 'Pending'
            }
        })

        return {
            input: text,
            ...response.output,
            context,
        }
    }
}

function parseSpecialization(area: string): Specialization {
    const values = Object.values(Specialization);

    if (values.includes(area as Specialization)) {
        return area as Specialization;
    }

    return Specialization.Civil; 
}