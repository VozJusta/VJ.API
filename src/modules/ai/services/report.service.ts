import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { RagService } from "@m/ai/services/rag.service";
import { LlmService } from "@m/ai/services/llm.service";
import { PrismaService } from "@m/prisma/service/prisma.service";
import { Specialization } from "generated/prisma/enums";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ContinueConversationDto } from "../dto/continue-conversation.dto";
import { toFile } from 'groq-sdk/uploads';
import { Groq } from "groq-sdk";
import { TranscribeAudioDTO } from "../dto/transcribe-audio.dto";

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
    ) {}

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

    async transcribeAudio(file: TranscribeAudioDTO) {
        try {
            if (!file) {
                throw new BadRequestException('Nenhum arquivo enviado');
            }

            const audioFile = await toFile(file.buffer, file.originalname, {
                type: file.mimetype,
            });

            const response = await this.groq.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-large-v3',
                language: 'pt',
                response_format: 'text',
            });

            return response as unknown as string;
        } catch (error) {
            throw new InternalServerErrorException('Erro ao transcrever o áudio: ' + error);
        }
    }

    async generate(simulationId: string) {
        const simulation = await this.prisma.simulation.findUniqueOrThrow({
            where: { id: simulationId },
            include: { turns: { orderBy: { created_at: 'asc' } } },
        });

        const transcript = simulation.turns
            .map(t => `${t.role === 'User' ? 'Usuário' : 'IA'}: ${t.content}`)
            .join('\n');

        const evaluation = await this.llmService.evaluateSimulation({
            transcript,
            personality: simulation.personality,
        });

        return this.prisma.simulationReport.create({
            data: {
                simulation_id: simulationId,
                user_id: simulation.citizen_id,
                full_transcript: simulation.turns.map(t => ({
                    role: t.role,
                    content: t.content,
                    created_at: t.created_at,
                })),
                score: evaluation.score,
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                metrics_json: evaluation.metrics,
                duration_secs: simulation.duration_secs,
                personality: simulation.personality,
            },
        });
    }


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
                citizen_id: userId,
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