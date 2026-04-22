import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { RagService } from "@m/ai/services/rag.service";
import { LlmService } from "@m/ai/services/llm.service";
import { PrismaService } from "@m/prisma/service/prisma.service";
import { Specialization } from "generated/prisma/enums";
import { NotFoundError } from "rxjs";
import { finished } from "stream";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";
import { toFile } from 'groq-sdk/uploads';
import { Groq } from "groq-sdk";
import { TranscribeAudioDTO } from "../dto/transcribe-audio.dto";


const MAX_TURNS = 6;

@Injectable()
export class ReportService implements OnModuleInit {
    private groq!: Groq

    onModuleInit() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })
    }

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

   
    async getHistoryChat(id: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: {
                id: id,
            },
            include: {
                messages: true
            },
        })

        if (!conversation) {
            throw new NotFoundException('Conversa não encontrada')
        }

        return {
            messages: conversation.messages
        }
    }

   
    }

   
    
    
