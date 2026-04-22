import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable } from "@nestjs/common";
import { LlmService } from "../llm.service";
import { Specialization } from "generated/prisma/client";

@Injectable()
export class ContinueConversationService {
    constructor(private prisma: PrismaService, private llmService: LlmService) { }

    async generateReportFromConversation(
        conversationId: string,
        caseId: string,
        userId: string
    ) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: { orderBy: { created_at: 'asc' } } }
        });

        const fullText = conversation?.messages
            .map(m => `${m.role === 'User' ? 'Usuário' : 'Assistente'}: ${m.content}`)
            .join('\n');

        const classification = await this.llmService.generate({
            input: `Classifique a área jurídica do texto: ${fullText}`,
            context: []
        });

        const area = parseSpecialization(classification.output?.area);

        const report = await this.prisma.report.create({
            data: {
                transcription: fullText || '',
                normalized_text: fullText || '',
                legal_analysis: '',
                simplified_explanation: '',
                category_detected: area,
                user_id: userId,
                caseId: caseId,
            }
        });

        let context = await this.ragService.retrieve(fullText || '', area);
        context = context.slice(0, 3);

        if (context.length > 0) {
            await this.prisma.ragContext.createMany({
                data: context.map((c) => ({
                    report_id: report.id,
                    source: (c.source as string) || 'qdrant',
                    content: String(c.content),
                    score: Number(c.score)
                }))
            });
        }

        const response = await this.llmService.generate({
            input: fullText || '',
            context,
        });

        await this.prisma.aiResponse.create({
            data: {
                report_id: report.id,
                model: 'llama-3.1-8b-instant',
                provider: 'groq',
                prompt: response.prompt,
                response: JSON.stringify(response.output)
            }
        });

        await this.prisma.report.update({
            where: { id: report.id },
            data: {
                legal_analysis: response.output.legal_analysis,
                simplified_explanation: response.output.simplified_explanation,
                category_detected: parseSpecialization(response.output.area),
            }
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { is_closed: true }
        });

        await this.prisma.message.deleteMany({
            where: { conversation_id: conversationId }
        })

        return {
            finished: true,
            caseId,
            conversationId: conversationId,
            reportId: report.id,
            input: fullText,
            ...response.output,
        };
    }


}

function parseSpecialization(area: string): Specialization {
    const values = Object.values(Specialization);

    if (values.includes(area as Specialization)) {
        return area as Specialization;
    }

    return Specialization.Civil;
}