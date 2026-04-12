import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RagService } from "./rag.service";
import { LlmService } from "./llm.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { Specialization } from "generated/prisma/enums";
import { NotFoundError } from "rxjs";
import { finished } from "stream";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";

const MAX_TURNS = 6;

@Injectable()
export class ReportService {
    constructor(
        private ragService: RagService,
        private llmService: LlmService,
        private prisma: PrismaService
    ) { }

    // async createReport(text: string, userId: string) {
    //     const classification = await this.llmService.generate({
    //         input: `Classifique a área jurídica do texto: ${text}`,
    //         context: []
    //     });

    //     const area = parseSpecialization(classification.output?.area)

    //     const report = await this.prisma.report.create({
    //         data: {
    //             transcription: text,
    //             normalized_text: text,
    //             legal_analysis: '',
    //             simplified_explanation: '',
    //             category_detected: area,
    //             user_id: userId,
    //             status: 'Pending'
    //         }
    //     })

    //     let context = await this.ragService.retrieve(text, area)

    //     context = context.slice(0, 3)

    //     if (context.length > 0) {
    //         await this.prisma.ragContext.createMany({
    //             data: context.map((c) => ({
    //                 report_id: report.id,
    //                 source: (c.source as string) || 'qdrant',
    //                 content: String(c.content),
    //                 score: Number(c.score)
    //             }))
    //         })
    //     }

    //     const response = await this.llmService.generate({
    //         input: text,
    //         context,
    //     })

    //     await this.prisma.aiResponse.create({
    //         data: {
    //             report_id: report.id,
    //             model: 'llama-3.1-8b-instant',
    //             provider: 'groq',
    //             prompt: response.prompt,
    //             response: JSON.stringify(response.output)
    //         }
    //     })

    //     await this.prisma.report.update({
    //         where: { id: report.id },
    //         data: {
    //             legal_analysis: response.output.legal_analysis,
    //             simplified_explanation: response.output.simplified_explanation,
    //             category_detected: parseSpecialization(response.output.area),
    //             status: 'Pending'
    //         }
    //     })

    //     return {
    //         input: text,
    //         ...response.output,
    //     }
    // }

    async startConversation(firstMessage: StartConversationDTO, userId: string) {
        const newCase = await this.prisma.case.create({
            data: {
                title: firstMessage.message.slice(0, 60),
                user_id: userId,
                status: 'Pending'
            }
        })

        const conversation = await this.prisma.conversation.create({
            data: {
                case_id: newCase.id,
                messages: {
                    create: {
                        role: 'User',
                        content: firstMessage.message,
                    }
                }
            },
            include: {
                messages: true
            }
        })

        const { shouldGenerate, questionOrAck } = await this.llmService.chat([
            { role: 'User', content: firstMessage.message }
        ])

        await this.prisma.message.create({
            data: {
                conversation_id: conversation.id,
                role: 'Assistant',
                content: questionOrAck
            }
        })

        if (shouldGenerate) {
            await this.generateReportFromConversation(conversation.id, newCase.id, userId)
        }

        return {
            conversationId: conversation.id,
            caseId: newCase.id,
            question: questionOrAck,
            finished: false,
        }
    }

    async continueConversation(continueConversation: ContinueConversationDto, userId: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: continueConversation.conversationId },
            include: { messages: { orderBy: { created_at: 'desc' } } }
        });

        if (!conversation) throw new NotFoundException('Conversa não encontrada');
        if (conversation.is_closed) throw new BadRequestException('Conversa já encerrada');

        await this.prisma.message.create({
            data: {
                conversation_id: continueConversation.conversationId,
                role: 'User',
                content: continueConversation.message,
            }
        });

        const allMessages = [
            ...conversation.messages,
            { role: 'User' as const, content: continueConversation.message }
        ];

        const userTurns = allMessages.filter(m => m.role === 'User').length;
        const forcedGenerate = userTurns >= MAX_TURNS;

        if (forcedGenerate) {
            return this.generateReportFromConversation(continueConversation.conversationId, conversation.case_id, userId);
        }

        const { shouldGenerate, questionOrAck } = await this.llmService.chat(
            allMessages.map(m => ({ role: m.role as 'User' | 'Assistant', content: m.content }))
        );

        await this.prisma.message.create({
            data: {
                conversation_id: continueConversation.conversationId,
                role: 'Assistant',
                content: questionOrAck,
            }
        });

        if (shouldGenerate) {
            return this.generateReportFromConversation(continueConversation.conversationId, conversation.case_id, userId);
        }

        return {
            conversationId: conversation.id,
            caseId: conversation.case_id,
            question: questionOrAck,
            finished: false,
        };
    }

    private async generateReportFromConversation(
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

        return {
            finished: true,
            caseId,
            reportId: report.id,
            input: fullText,
            ...response.output,
        };
    }

    async acceptCase(caseId: string, lawyerId: string, role: string) {
        const caso = await this.prisma.case.findUnique({
            where: {
                id: caseId
            }
        })

        if (!caso) {
            throw new NotFoundException('Caso não encontrado')
        }

        if (role === "Citizen") {
            throw new UnauthorizedException('Usuário não autorizado')
        }

        await this.prisma.case.update({
            where: { id: caseId },
            data: {
                status: 'Accepted',
                lawyer_id: lawyerId
            }
        })

        return {
            message: 'Caso aceito com sucesso'
        }
    }

    async rejectCase(caseId: string, role: string) {
        const caso = await this.prisma.case.findUnique({
            where: {
                id: caseId
            }
        })

        if (!caso) {
            throw new NotFoundException('Caso não encontrado')
        }

        if (role === "Citizen") {
            throw new UnauthorizedException('Usuário não autorizado')
        }

        await this.prisma.case.update({
            where: { id: caseId },
            data: {
                status: 'Refused',
            }
        })

        return {
            message: 'Caso recusado'
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